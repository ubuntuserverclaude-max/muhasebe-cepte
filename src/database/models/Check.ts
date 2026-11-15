import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Check extends Model {
  static table = 'checks';

  @field('company_id') companyId!: string;
  @field('check_number') checkNumber!: string;
  @field('contact_id') contactId!: string;
  @field('type') type!: 'received' | 'given';
  @field('amount') amount!: number;
  @date('due_date') dueDate!: Date;
  @field('bank_name') bankName?: string;
  @field('drawer') drawer?: string;
  @field('status') status!: 'portfolio' | 'collected' | 'paid' | 'endorsed';
  @field('notes') notes?: string;
  @readonly @date('created_at') createdAt!: Date;
}
