import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

export type UserRole = 'ADMIN' | 'LANDLORD' | 'TENANT';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
}

class AuthService {
  private supabase = createClientComponentClient<Database>();

  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            fullName: data.fullName, // Backup field
            role: data.role,
            phone: data.phone || '',
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Wait a bit for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify profile was created
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile verification error:', profileError);
        // Don't throw here, profile might be created by trigger
      }

      return {
        user: authData.user,
        profile: profile,
        session: authData.session,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to load user profile');
      }

      return {
        user: data.user,
        profile: profile,
        session: data.session,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        return null;
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        role: profile.role as UserRole,
        fullName: profile.full_name,
        phone: profile.phone,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async updatePassword(password: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<{ fullName: string; phone: string }>) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          full_name: updates.fullName,
          phone: updates.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser();
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();