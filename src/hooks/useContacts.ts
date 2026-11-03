import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import { Contact } from '@/database/models/Contact';
import { useAuthStore } from '@/store/authStore';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const companyId = user?.user_metadata?.company_id;

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const subscription = database
      .get<Contact>('contacts')
      .query(Q.where('company_id', companyId), Q.sortBy('name', Q.asc))
      .observe()
      .subscribe((data) => {
        setContacts(data);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
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

  return { contacts, loading, addContact };
}
