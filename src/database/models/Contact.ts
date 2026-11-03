import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Contact extends Model {
  static table = 'contacts';

  @field('company_id') companyId!: string;
  @field('type') type!: 'customer' | 'supplier' | 'both';
  @field('name') name!: string;
  @field('tax_number') taxNumber?: string;
  @field('phone') phone?: string;
  @field('email') email?: string;
  @field('address') address?: string;
  @field('balance') balance!: number;
  @readonly @date('created_at') createdAt!: Date;
}
