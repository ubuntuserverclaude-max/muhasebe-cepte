import { useState, useEffect } from 'react';
import { database } from '@/database';
import { PromissoryNote } from '@/database/models/PromissoryNote';

export interface PromissoryNoteInput {
  noteNumber?: string;
  contactId: string;
  type: 'received' | 'given';
  amount: number;
  dueDate: Date;
  debtor?: string;
  guarantor?: string;
  status: 'portfolio' | 'collected' | 'paid' | 'endorsed';
  notes?: string;
}

export function usePromissoryNotes() {
  const [notes, setNotes] = useState<PromissoryNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get<PromissoryNote>('promissory_notes');
    const subscription = collection.query().observe().subscribe((records) => {
      setNotes(records);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const addPromissoryNote = async (input: PromissoryNoteInput) => {
    await database.write(async () => {
      const collection = database.get<PromissoryNote>('promissory_notes');
      await collection.create((note) => {
        note.companyId = 'default-company';
        note.noteNumber = input.noteNumber;
        note.contactId = input.contactId;
        note.type = input.type;
        note.amount = input.amount;
        note.dueDate = input.dueDate;
        note.debtor = input.debtor;
        note.guarantor = input.guarantor;
        note.status = input.status;
        note.notes = input.notes;
      });
    });
  };

  const updateNoteStatus = async (noteId: string, status: 'portfolio' | 'collected' | 'paid' | 'endorsed') => {
    await database.write(async () => {
      const collection = database.get<PromissoryNote>('promissory_notes');
      const note = await collection.find(noteId);
      await note.update((record) => {
        record.status = status;
      });
    });
  };

  return { notes, loading, addPromissoryNote, updateNoteStatus };
}
