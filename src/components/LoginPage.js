"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

const LoginPage = () => {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        // Apply theme from localStorage for standalone LoginPage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('theme-light');
        } else {
            document.body.classList.remove('theme-light');
        }

        // Ensure body scrolling is enabled for the login page
        document.body.classList.remove('no-scroll');
    }, []);

    useEffect(() => {
        // Debug logging
        const debug = `Loading: ${loading}, User: ${!!user}, Redirecting: ${isRedirecting}`;
        setDebugInfo(debug);
        console.log('LoginPage state:', debug);

        // Only redirect if we have a user and we're not already loading/redirecting
        if (user && !loading && !isRedirecting) {
            console.log("User authenticated, starting redirect to /app");
            setIsRedirecting(true);
            
            // Use a more immediate redirect
            router.replace('/app');
        }
    }, [user, loading, router, isRedirecting]);

    // Handle sign in with better error handling
    const handleSignIn = async () => {
        try {
            console.log('Starting Google sign in...');
            await signInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
            setIsRedirecting(false);
        }
    };

    // Show loading state while checking auth or redirecting
    if (loading) {
        return (
            <div className="login-page-container">
                <div className="login-box">
                    <FaSpinner className="fa-spin" size={50} />
                    <p>Loading Authentication...</p>
                    <small style={{ marginTop: '10px', color: '#666' }}>{debugInfo}</small>
                </div>
            </div>
        );
    }

    if (isRedirecting) {
        return (
            <div className="login-page-container">
                <div className="login-box">
                    <FaSpinner className="fa-spin" size={50} />
                    <p>Redirecting to app...</p>
                    <small style={{ marginTop: '10px', color: '#666' }}>{debugInfo}</small>
                    <button 
                        onClick={() => {
                            setIsRedirecting(false);
                            router.replace('/app');
                        }}
                        style={{ marginTop: '20px', padding: '10px', background: '#666', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Force Redirect
                    </button>
                </div>
            </div>
        );
    }

    // Show login form for non-authenticated users
    return (
        <div className="login-page-container">
            <div className="login-box">
                <h2>Welcome to Project Theta</h2>
                <p>Please log in to continue.</p>
                <button
                    onClick={handleSignIn}
                    className="login-button google-login"
                    disabled={loading || isRedirecting}
                >
                    <FaGoogle style={{ marginRight: '10px' }} />
                    Login with Google
                </button>
                <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                    <a href="/" style={{ color: 'var(--accent-primary)' }}>Back to Home</a>
                </p>
                <small style={{ marginTop: '10px', color: '#666', display: 'block' }}>
                    Debug: {debugInfo}
                </small>
            </div>
        </div>
    );
};

export default LoginPage;