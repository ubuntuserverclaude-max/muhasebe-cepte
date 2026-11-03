-- Firmalar (Tenants)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tax_number TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kullanıcılar (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'accountant', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cariler (Müşteri/Tedarikçi)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
  name TEXT NOT NULL,
  tax_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contacts_company ON contacts(company_id);

-- Ürün/Hizmetler
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT DEFAULT 'adet',
  price DECIMAL(15,2) NOT NULL,
  stock_quantity DECIMAL(15,3) DEFAULT 0,
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT stock_not_negative CHECK (stock_quantity >= 0)
);

CREATE INDEX idx_products_company ON products(company_id);

-- İşlemler (Transactions)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT,
  payment_method TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);

-- Faturalar
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('sales', 'purchase')),
  date DATE NOT NULL,
  due_date DATE,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, invoice_number)
);

CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Fatura Kalemleri
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(15,3) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
  tax_rate DECIMAL(5,2) DEFAULT 0,
  amount DECIMAL(15,2) NOT NULL
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users see only their company data
CREATE POLICY "Users see own company"
  ON companies FOR ALL
  USING (id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid);

CREATE POLICY "Users see own company users"
  ON users FOR ALL
  USING (company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid);

CREATE POLICY "Users see own company contacts"
  ON contacts FOR ALL
  USING (company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid);

CREATE POLICY "Users see own company products"
  ON products FOR ALL
  USING (company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid);

CREATE POLICY "Users see own company transactions"
  ON transactions FOR ALL
  USING (company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid);

CREATE POLICY "Users see own company invoices"
  ON invoices FOR ALL
  USING (company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid);

CREATE POLICY "Users see invoice items from own company invoices"
  ON invoice_items FOR ALL
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
    )
  );

-- Function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET
    subtotal = (
      SELECT COALESCE(SUM(amount), 0)
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    ),
    tax_amount = (
      SELECT COALESCE(SUM(amount * tax_rate / 100), 0)
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    )
  WHERE id = NEW.invoice_id;

  UPDATE invoices
  SET total = subtotal + tax_amount
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_totals();

-- Function to update contact balance
CREATE OR REPLACE FUNCTION update_contact_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE contacts
    SET balance = balance - OLD.total
    WHERE id = OLD.contact_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE contacts
    SET balance = balance - OLD.total + NEW.total
    WHERE id = NEW.contact_id;
    RETURN NEW;
  ELSE
    UPDATE contacts
    SET balance = balance + NEW.total
    WHERE id = NEW.contact_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_balance
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW
  WHEN (NEW.status = 'paid' OR OLD.status = 'paid')
  EXECUTE FUNCTION update_contact_balance();
