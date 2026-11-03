import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Product extends Model {
  static table = 'products';

  @field('company_id') companyId!: string;
  @field('name') name!: string;
  @field('description') description?: string;
  @field('category') category?: string;
  @field('unit') unit!: string;
  @field('price') price!: number;
  @field('stock_quantity') stockQuantity!: number;
  @field('barcode') barcode?: string;
  @readonly @date('created_at') createdAt!: Date;
}
