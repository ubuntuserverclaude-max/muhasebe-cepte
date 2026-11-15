import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class PromissoryNote extends Model {
  static table = 'promissory_notes';

  @field('company_id') companyId!: string;
  @field('note_number') noteNumber?: string;
  @field('contact_id') contactId!: string;
  @field('type') type!: 'received' | 'given';
  @field('amount') amount!: number;
  @date('due_date') dueDate!: Date;
  @field('debtor') debtor?: string;
  @field('guarantor') guarantor?: string;
  @field('status') status!: 'portfolio' | 'collected' | 'paid' | 'endorsed';
  @field('notes') notes?: string;
  @readonly @date('created_at') createdAt!: Date;
}
