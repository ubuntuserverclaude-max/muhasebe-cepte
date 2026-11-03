-- WatermelonDB senkronizasyon fonksiyonları
-- Uygulama çevrimdışı çalışır; bu fonksiyonlar sunucu senkronizasyonu içindir.

CREATE OR REPLACE FUNCTION pull_changes(last_pulled_at bigint, company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  since timestamptz := to_timestamp(last_pulled_at / 1000.0);
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'changes', jsonb_build_object(
      'transactions', jsonb_build_object(
        'created', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM transactions t
          WHERE t.company_id = pull_changes.company_id AND t.created_at > since), '[]'::jsonb),
        'updated', '[]'::jsonb,
        'deleted', '[]'::jsonb
      ),
      'contacts', jsonb_build_object(
        'created', COALESCE((SELECT jsonb_agg(to_jsonb(c)) FROM contacts c
          WHERE c.company_id = pull_changes.company_id AND c.created_at > since), '[]'::jsonb),
        'updated', '[]'::jsonb,
        'deleted', '[]'::jsonb
      ),
      'products', jsonb_build_object(
        'created', COALESCE((SELECT jsonb_agg(to_jsonb(p)) FROM products p
          WHERE p.company_id = pull_changes.company_id AND p.created_at > since), '[]'::jsonb),
        'updated', '[]'::jsonb,
        'deleted', '[]'::jsonb
      ),
      'invoices', jsonb_build_object(
        'created', COALESCE((SELECT jsonb_agg(to_jsonb(i)) FROM invoices i
          WHERE i.company_id = pull_changes.company_id AND i.created_at > since), '[]'::jsonb),
        'updated', '[]'::jsonb,
        'deleted', '[]'::jsonb
      )
    ),
    'timestamp', (extract(epoch FROM now()) * 1000)::bigint
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION push_changes(changes jsonb, company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- İlk sürüm: kayıtlar cihazda tutulur, sunucu tarafı ileride genişletilir.
  -- Fonksiyonun var olması senkronizasyon akışının hata vermeden çalışması için yeterlidir.
  PERFORM 1;
END;
$$;
