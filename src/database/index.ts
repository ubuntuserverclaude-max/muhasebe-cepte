import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { Company } from './models/Company';
import { Transaction } from './models/Transaction';
import { Contact } from './models/Contact';
import { Product } from './models/Product';
import { Invoice } from './models/Invoice';
import { InvoiceItem } from './models/InvoiceItem';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'MuhasebeDB',
});

export const database = new Database({
  adapter,
  modelClasses: [Company, Transaction, Contact, Product, Invoice, InvoiceItem],
});
