import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import { Contact } from '@/database/models/Contact';
import { useAuthStore } from '@/store/authStore';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const companyId = user?.user_metadata?.company_id || 'default-company';

  const loadData = () => {
    setLoading(true);
    setError(null);
    try {
      const subscription = database
        .get<Contact>('contacts')
        .query(
          Q.where('company_id', companyId),
          Q.sortBy('name', Q.asc)
        )
        .observe()
        .subscribe(
          (data) => {
            setContacts(data);
            setLoading(false);
          },
          (err) => {
            console.error('Contacts error:', err);
            setError(err?.message || 'Cariler yüklenirken hata oluştu');
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
      console.error('Contacts query error:', err);
      setError(err?.message || 'Cariler yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  useEffect(() => {
    const cleanup = loadData();
    return () => {
      if (cleanup) cleanup();
    };
  }, [companyId]);

  const addContact = async (data: {
    type: 'customer' | 'supplier' | 'both';
    name: string;
    taxNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    if (!companyId) return;

    await database.write(async () => {
      await database.get<Contact>('contacts').create((contact) => {
        contact.companyId = companyId;
        contact.type = data.type;
        contact.name = data.name;
        contact.taxNumber = data.taxNumber;
        contact.phone = data.phone;
        contact.email = data.email;
        contact.address = data.address;
        contact.balance = 0;
      });
    });
  };

  return { contacts, loading, error, refetch: loadData, addContact };
}
