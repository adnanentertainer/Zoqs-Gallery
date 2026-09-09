"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mapProfileRow } from "@/lib/supabase/mappers";
import { toFriendlyAuthError } from "@/lib/auth/errors";
import type { Profile } from "@/types";

const NOT_CONFIGURED_ERROR =
  "Authentication isn't configured yet. Add Supabase credentials to enable sign in.";

interface UpdateProfileInput {
  fullName: string;
  phone: string;
}

interface AuthResult {
  error: string | null;
}

interface SignUpResult extends AuthResult {
  needsEmailConfirmation: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

/**
 * `initialUser` comes from a server-side `auth.getUser()` call (see
 * app/layout.tsx), which Supabase revalidates against its Auth server — so
 * it's already authoritative on first paint. That means no loading gate is
 * needed for the initial render (avoids "flickering authenticated content").
 * `onAuthStateChange` is the single source of truth for everything after
 * that: it fires once immediately with the current session, then again on
 * every sign-in/out/refresh, so isLoading only reflects that first callback.
 */
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(
    () => (configured ? getSupabaseBrowserClient() : null),
    [configured],
  );

  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[AuthContext] Failed to load profile:", error);
        return;
      }
      setProfile(data ? mapProfileRow(data) : null);
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);

      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<SignUpResult> => {
      if (!supabase) {
        return { error: NOT_CONFIGURED_ERROR, needsEmailConfirmation: false };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=/account`
              : undefined,
        },
      });
      if (error) {
        return {
          error: toFriendlyAuthError(error),
          needsEmailConfirmation: false,
        };
      }
      return { error: null, needsEmailConfirmation: !data.session };
    },
    [supabase],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { error: NOT_CONFIGURED_ERROR };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? toFriendlyAuthError(error) : null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user.id);
  }, [user, loadProfile]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<AuthResult> => {
      if (!supabase || !user) {
        return { error: "You must be signed in to update your profile." };
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: input.fullName.trim(),
          phone: input.phone.trim() || null,
        })
        .eq("id", user.id);

      if (error) {
        console.error("[AuthContext] updateProfile failed:", error);
        return {
          error:
            "Something went wrong updating your profile. Please try again.",
        };
      }

      await loadProfile(user.id);
      return { error: null };
    },
    [supabase, user, loadProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      session,
      isLoading,
      isAuthenticated: user !== null,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [
      user,
      profile,
      session,
      isLoading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
