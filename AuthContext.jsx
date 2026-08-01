import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Single place that creates/loads the broker profile.
  // Uses upsert with onConflict so it is safe to call more than once
  // (e.g. once right after signup, again on auth state change) without
  // ever throwing a duplicate-key error.
  async function ensureProfile(user, displayNameFromSignup) {
    if (!user) return null;

    const displayName =
      displayNameFromSignup || user.user_metadata?.display_name || 'Broker';

    const { data, error } = await supabase
      .from('broker_profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: displayName,
          currency: 'INR',
          plan: 'free',
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) {
      console.error('[Estanza] ensureProfile error:', error);
      return null;
    }
    return data;
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const p = await ensureProfile(session.user);
        setProfile(p);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const p = await ensureProfile(session.user);
          setProfile(p);
        } else {
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signUp(displayName, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
    if (data.session?.user) {
      const p = await ensureProfile(data.session.user, displayName);
      setProfile(p);
    }
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function updateProfile(fields) {
    if (!session?.user) return null;
    const { data, error } = await supabase
      .from('broker_profiles')
      .update(fields)
      .eq('user_id', session.user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  }

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
