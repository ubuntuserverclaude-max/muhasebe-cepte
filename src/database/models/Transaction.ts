import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Transaction extends Model {
  static table = 'transactions';

  @field('company_id') companyId!: string;
  @field('type') type!: 'income' | 'expense';
  @field('contact_id') contactId?: string;
  @field('amount') amount!: number;
  @field('description') description!: string;
  @field('category') category?: string;
  @field('payment_method') paymentMethod?: string;
  @date('date') date!: Date;
  @readonly @date('created_at') createdAt!: Date;
}
