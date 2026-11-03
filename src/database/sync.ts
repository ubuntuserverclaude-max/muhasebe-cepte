import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';
import { supabase } from '@/config/supabase';

/**
 * WatermelonDB <-> Supabase senkronizasyonu.
 * Supabase tarafında pull_changes / push_changes RPC fonksiyonları gerekir
 * (supabase/migrations/002_sync_functions.sql).
 * Fonksiyonlar yoksa hata yutulur; uygulama çevrimdışı çalışmaya devam eder.
 */
export async function syncDatabase(companyId: string): Promise<void> {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const { data, error } = await supabase.rpc('pull_changes', {
        last_pulled_at: lastPulledAt ?? 0,
        company_id: companyId,
      });
      if (error) throw error;
      return { changes: data.changes, timestamp: data.timestamp };
    },
    pushChanges: async ({ changes }) => {
      const { error } = await supabase.rpc('push_changes', {
        changes,
        company_id: companyId,
      });
      if (error) throw error;
    },
  });
}
