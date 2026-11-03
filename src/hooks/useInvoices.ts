import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import { Invoice } from '@/database/models/Invoice';
import { InvoiceItem } from '@/database/models/InvoiceItem';
import { useAuthStore } from '@/store/authStore';

export interface InvoiceItemInput {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const companyId = user?.user_metadata?.company_id;

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const subscription = database
      .get<Invoice>('invoices')
      .query(Q.where('company_id', companyId), Q.sortBy('date', Q.desc))
      .observe()
      .subscribe((data) => {
        setInvoices(data);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [companyId]);

  const addInvoice = async (data: {
    invoiceNumber: string;
    contactId: string;
    type: 'sales' | 'purchase';
    date: Date;
    dueDate?: Date;
    status: 'draft' | 'sent' | 'paid' | 'cancelled';
    notes?: string;
    items: InvoiceItemInput[];
  }) => {
    if (!companyId) return;

    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
      0
    );
    const total = subtotal + taxAmount;

    await database.write(async () => {
      const invoice = await database.get<Invoice>('invoices').create((inv) => {
        inv.companyId = companyId;
        inv.invoiceNumber = data.invoiceNumber;
        inv.contactId = data.contactId;
        inv.type = data.type;
        inv.date = data.date;
        inv.dueDate = data.dueDate;
        inv.subtotal = subtotal;
        inv.taxAmount = taxAmount;
        inv.total = total;
        inv.status = data.status;
        inv.notes = data.notes;
      });

      for (const item of data.items) {
        await database.get<InvoiceItem>('invoice_items').create((row) => {
          row.invoiceId = invoice.id;
          row.productId = item.productId;
          row.description = item.description;
          row.quantity = item.quantity;
          row.unitPrice = item.unitPrice;
          row.taxRate = item.taxRate;
          row.amount = item.quantity * item.unitPrice;
        });
      }
    });
  };

  return { invoices, loading, addInvoice };
}
