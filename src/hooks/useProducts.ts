import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import { Product } from '@/database/models/Product';
import { useAuthStore } from '@/store/authStore';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const companyId = user?.user_metadata?.company_id;

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const subscription = database
      .get<Product>('products')
      .query(Q.where('company_id', companyId), Q.sortBy('name', Q.asc))
      .observe()
      .subscribe((data) => {
        setProducts(data);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [companyId]);

  const addProduct = async (data: {
    name: string;
    description?: string;
    category?: string;
    unit: string;
    price: number;
    stockQuantity: number;
    barcode?: string;
  }) => {
    if (!companyId) return;

    await database.write(async () => {
      await database.get<Product>('products').create((product) => {
        product.companyId = companyId;
        product.name = data.name;
        product.description = data.description;
        product.category = data.category;
        product.unit = data.unit;
        product.price = data.price;
        product.stockQuantity = data.stockQuantity;
        product.barcode = data.barcode;
      });
    });
  };

  return { products, loading, addProduct };
}
