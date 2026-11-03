import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { syncDatabase } from '@/database/sync';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user, session: data.session });
  },

  signUp: async (email, password, fullName, companyName) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (authError) throw authError;

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({ name: companyName })
      .select()
      .single();
    if (companyError) throw companyError;

    await supabase.auth.updateUser({
      data: { company_id: company.id },
    });

    await supabase.from('users').insert({
      id: authData.user!.id,
      company_id: company.id,
      full_name: fullName,
      role: 'owner',
    });

    set({ user: authData.user, session: authData.session });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const companyId = session.user.user_metadata?.company_id;
      if (!companyId) {
        await supabase.auth.signOut();
        throw new Error('Invalid user: missing company_id');
      }
    }

    set({ user: session?.user ?? null, session, loading: false });

    if (session?.user?.user_metadata?.company_id) {
      syncDatabase(session.user.user_metadata.company_id).catch((err) =>
        console.warn('İlk senkronizasyon başarısız (çevrimdışı devam ediliyor):', err)
      );
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session });
    });
  },
}));
