import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Company extends Model {
  static table = 'companies';

  @field('name') name!: string;
  @field('tax_number') taxNumber?: string;
  @field('address') address?: string;
  @field('phone') phone?: string;
  @field('email') email?: string;
  @field('settings') settings?: string;
  @readonly @date('created_at') createdAt!: Date;
}
