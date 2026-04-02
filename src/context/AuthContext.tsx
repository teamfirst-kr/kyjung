import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types/user';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  userRole: UserRole;
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, name: string, role?: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setDemoRole: (role: UserRole) => void; // 데모용 역할 전환
}

const AuthContext = createContext<AuthContextValue | null>(null);

// 데모 모드용 mock user (Supabase 미연결 시 역할별로 사용)
const DEMO_USERS: Record<UserRole, UserProfile> = {
  consumer: {
    id: 'demo-consumer-001',
    email: 'consumer@demo.com',
    name: '데모 소비자',
    role: 'consumer',
    created_at: new Date().toISOString(),
  },
  seller: {
    id: 'demo-seller-001',
    email: 'seller@demo.com',
    name: '데모 판매자',
    role: 'seller',
    bakery_id: 'b3', // 밀도 (입점 매장)
    created_at: new Date().toISOString(),
  },
  admin: {
    id: 'demo-admin-001',
    email: 'admin@demo.com',
    name: '데모 관리자',
    role: 'admin',
    created_at: new Date().toISOString(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoRole, setDemoRole] = useState<UserRole>('admin'); // 데모 기본값

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUser(data as UserProfile);
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      alert('Supabase 설정이 필요합니다. .env 파일을 확인해주세요.');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const signInWithKakao = async () => {
    if (!isSupabaseConfigured()) {
      alert('Supabase 설정이 필요합니다. .env 파일을 확인해주세요.');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: window.location.origin },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase 미설정' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUpWithEmail = async (email: string, password: string, name: string, role: UserRole = 'consumer') => {
    if (!isSupabaseConfigured()) {
      // 데모 모드: 역할 즉시 적용
      setDemoRole(role);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const userRole: UserRole = user?.role ?? demoRole;
  // 데모 모드(Supabase 미연결)에서는 역할에 맞는 mock user 제공
  const effectiveUser = user ?? (!isSupabaseConfigured() ? DEMO_USERS[demoRole] : null);

  return (
    <AuthContext.Provider value={{
      user: effectiveUser,
      loading,
      userRole,
      signInWithGoogle,
      signInWithKakao,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      setDemoRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
