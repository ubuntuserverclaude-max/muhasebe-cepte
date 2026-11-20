import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import { Transaction } from '@/database/models/Transaction';
import { useAuthStore } from '@/store/authStore';

export function useTransactions(limit = 50) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const companyId = user?.user_metadata?.company_id || 'default-company';

  const loadData = () => {
    setLoading(true);
    setError(null);
    try {
      const subscription = database
        .get<Transaction>('transactions')
        .query(
          Q.where('company_id', companyId),
          Q.sortBy('date', Q.desc),
          Q.take(limit)
        )
        .observe()
        .subscribe(
          (data) => {
            setTransactions(data);
            setLoading(false);
          },
          (err) => {
            console.error('Transactions error:', err);
            setError(err?.message || 'İşlemler yüklenirken hata oluştu');
            setLoading(false);
          }
        );

      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    } catch (err: any) {
      console.error('Transactions query error:', err);
      setError(err?.message || 'İşlemler yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  useEffect(() => {
    const cleanup = loadData();
    return () => {
      if (cleanup) cleanup();
    };
  }, [companyId, limit]);

  const addTransaction = async (data: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    date: Date;
    category?: string;
    paymentMethod?: string;
    contactId?: string;
  }) => {
    if (!companyId) return;

    await database.write(async () => {
      await database.get<Transaction>('transactions').create((transaction) => {
        transaction.companyId = companyId;
        transaction.type = data.type;
        transaction.amount = data.amount;
        transaction.description = data.description;
        transaction.date = data.date;
        transaction.category = data.category;
        transaction.paymentMethod = data.paymentMethod;
        transaction.contactId = data.contactId;
      });
    });
  };

  return { transactions, loading, error, refetch: loadData, addTransaction };
}
