import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class InvoiceItem extends Model {
  static table = 'invoice_items';

  @field('invoice_id') invoiceId!: string;
  @field('product_id') productId?: string;
  @field('description') description!: string;
  @field('quantity') quantity!: number;
  @field('unit_price') unitPrice!: number;
  @field('tax_rate') taxRate!: number;
  @field('amount') amount!: number;
}
