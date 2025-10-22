
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../lib/types';
import { supabase } from '../lib/supabaseClient';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  setSession: (session) => {
    set({ session });
    if (session) {
      get().fetchProfile();
    } else {
      set({ profile: null, loading: false });
    }
  },
  setProfile: (profile) => set({ profile }),
  fetchProfile: async () => {
    set({ loading: true });
    try {
      const { session } = get();
      if (session?.user) {
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`*`)
          .eq('id', session.user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          set({ profile: data as Profile });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
