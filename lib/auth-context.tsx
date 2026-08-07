"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  email: string | null;
  credits: number;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  authOpen: boolean;
  outOfCreditsOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  openOutOfCredits: () => void;
  closeOutOfCredits: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(!supabase));
  const [authOpen, setAuthOpen] = useState(false);
  const [outOfCreditsOpen, setOutOfCreditsOpen] = useState(false);

  const refreshProfile = useCallback(async (userId?: string) => {
    const id = userId ?? user?.id;
    if (!id || !supabase) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, email, credits")
      .eq("id", id)
      .maybeSingle();
    setProfile((data as Profile) ?? null);
  }, [user?.id]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) void refreshProfile(sessionUser.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) void refreshProfile(sessionUser.id);
      else setProfile(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const openOutOfCredits = useCallback(() => setOutOfCreditsOpen(true), []);
  const closeOutOfCredits = useCallback(
    () => setOutOfCreditsOpen(false),
    []
  );

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isConfigured: Boolean(supabase),
      authOpen,
      outOfCreditsOpen,
      openAuth,
      closeAuth,
      openOutOfCredits,
      closeOutOfCredits,
      refreshProfile,
      signOut,
    }),
    [
      user,
      profile,
      loading,
      authOpen,
      outOfCreditsOpen,
      openAuth,
      closeAuth,
      openOutOfCredits,
      closeOutOfCredits,
      refreshProfile,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
