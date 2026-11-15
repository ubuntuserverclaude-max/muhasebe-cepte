import { useState, useEffect } from 'react';
import { database } from '@/database';
import { Check } from '@/database/models/Check';

export interface CheckInput {
  checkNumber: string;
  contactId: string;
  type: 'received' | 'given';
  amount: number;
  dueDate: Date;
  bankName?: string;
  drawer?: string;
  status: 'portfolio' | 'collected' | 'paid' | 'endorsed';
  notes?: string;
}

export function useChecks() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get<Check>('checks');
    const subscription = collection.query().observe().subscribe((records) => {
      setChecks(records);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const addCheck = async (input: CheckInput) => {
    await database.write(async () => {
      const collection = database.get<Check>('checks');
      await collection.create((check) => {
        check.companyId = 'default-company';
        check.checkNumber = input.checkNumber;
        check.contactId = input.contactId;
        check.type = input.type;
        check.amount = input.amount;
        check.dueDate = input.dueDate;
        check.bankName = input.bankName;
        check.drawer = input.drawer;
        check.status = input.status;
        check.notes = input.notes;
      });
    });
  };

  const updateCheckStatus = async (checkId: string, status: 'portfolio' | 'collected' | 'paid' | 'endorsed') => {
    await database.write(async () => {
      const collection = database.get<Check>('checks');
      const check = await collection.find(checkId);
      await check.update((record) => {
        record.status = status;
      });
    });
  };

  return { checks, loading, addCheck, updateCheckStatus };
}
