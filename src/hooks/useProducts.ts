import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import { Product } from '@/database/models/Product';
import { useAuthStore } from '@/store/authStore';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const companyId = user?.user_metadata?.company_id || 'default-company';

  const loadData = () => {
    setLoading(true);
    setError(null);
    try {
      const subscription = database
        .get<Product>('products')
        .query(
          Q.where('company_id', companyId),
          Q.sortBy('name', Q.asc)
        )
        .observe()
        .subscribe(
          (data) => {
            setProducts(data);
            setLoading(false);
          },
            (err) => {
            console.error('Products error:', err);
            setError(err?.message || 'Ürünler yüklenirken hata oluştu');
            setLoading(false);
          }
        );

      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    } catch (err: any) {
      console.error('Products query error:', err);
      setError(err?.message || 'Ürünler yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  useEffect(() => {
    const cleanup = loadData();
    return () => {
      if (cleanup) cleanup();
    };
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

  return { products, loading, error, refetch: loadData, addProduct };
}
