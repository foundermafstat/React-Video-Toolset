import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile, UserRole } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          await createProfile(userId);
        } else {
          setLoading(false);
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) {
        setLoading(false);
        return;
      }

      console.log('Creating profile for:', userData.user.email);
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userData.user.email,
            role: 'VIEWER' as UserRole,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setLoading(false);
      } else {
        console.log('Profile created successfully:', data);
        setProfile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        setLoading(false);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
        }
      });
      
      if (error) {
        setLoading(false);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    return { error };
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!profile) return false;
    
    const roleHierarchy = {
      ADMIN: 3,
      EDITOR: 2,
      VIEWER: 1,
    };

    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  };

  const isAdmin = (): boolean => profile?.role === 'ADMIN';
  const canEdit = (): boolean => hasRole('EDITOR');

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    canEdit,
  };
}