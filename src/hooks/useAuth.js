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
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/app`, // Explicit redirect
                },
            });
            if (error) {
                console.error('Error signing in with Google:', error.message);
                alert(`Google Sign-In Error: ${error.message}`);
                setLoading(false);
            }
            // Don't set loading to false here - let the auth state change handle it
        } catch (error) {
            console.error('Unexpected error during Google sign-in:', error);
            alert('An unexpected error occurred during sign-in.');
            setLoading(false);
        }
    }, []);

    // Function to handle Sign Out
    const signOut = useCallback(async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error.message);
                alert(`Sign Out Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Unexpected error during sign-out:', error);
            alert('An unexpected error occurred during sign-out.');
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
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Error getting initial session:", error);
                } else if (isMounted) {
                    console.log("Initial session check:", !!initialSession, initialSession?.user?.id);
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
                    console.log("Auth State Change:", event, !!currentSession, currentSession?.user?.id);
                    setSession(currentSession);
                    setUser(currentSession?.user ?? null);
                    setLoading(false);
                    
                    // Handle successful sign in
                    if (event === 'SIGNED_IN' && currentSession) {
                        console.log("User signed in successfully");
                        // The middleware will handle the redirect
                    }
                    
                    // Handle sign out
                    if (event === 'SIGNED_OUT') {
                        console.log("User signed out");
                        // Clear any cached data if needed
                    }
                }
            }
        );

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
            console.log("Auth listener unsubscribed.");
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