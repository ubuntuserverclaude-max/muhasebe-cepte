import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Invoice extends Model {
  static table = 'invoices';

  @field('company_id') companyId!: string;
  @field('invoice_number') invoiceNumber!: string;
  @field('contact_id') contactId!: string;
  @field('type') type!: 'sales' | 'purchase';
  @date('date') date!: Date;
  @date('due_date') dueDate?: Date;
  @field('subtotal') subtotal!: number;
  @field('tax_amount') taxAmount!: number;
  @field('total') total!: number;
  @field('status') status!: 'draft' | 'sent' | 'paid' | 'cancelled';
  @field('notes') notes?: string;
  @readonly @date('created_at') createdAt!: Date;
}
