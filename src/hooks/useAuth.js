"use client"
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';

// Create the Auth Context
const AuthContext = createContext(null);

// Create a Provider Component
export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to handle Google Sign In
    const signInWithGoogle = useCallback(async () => {
        try {
            console.log('Initiating Google OAuth...');
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/app`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                },
            });
            
            if (error) {
                console.error('Error signing in with Google:', error.message);
                throw error;
            }
            
            console.log('OAuth initiated successfully:', data);
        } catch (error) {
            console.error('Unexpected error during Google sign-in:', error);
            throw error;
        }
    }, []);

    // Function to handle Sign Out
    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error.message);
                throw error;
            }
        } catch (error) {
            console.error('Unexpected error during sign-out:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to get the initial session and listen for auth changes
    useEffect(() => {
        let isMounted = true;

        // Get initial session
        const getInitialSession = async () => {
            try {
                console.log('Getting initial session...');
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Error getting initial session:", error);
                } else if (isMounted) {
                    console.log('Initial session:', !!initialSession);
                    setSession(initialSession);
                    setUser(initialSession?.user ?? null);
                }
            } catch (error) {
                console.error("Error getting initial session:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getInitialSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                if (isMounted) {
                    console.log("Auth State Change:", event, !!currentSession);
                    setSession(currentSession);
                    setUser(currentSession?.user ?? null);
                    
                    // Only set loading to false after we've processed the auth change
                    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                        setLoading(false);
                    }
                }
            }
        );

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user,
        loading,
        signInWithGoogle,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};