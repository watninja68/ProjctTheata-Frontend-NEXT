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
        // Only redirect if we have a user and we're not already loading/redirecting
        if (user && !loading && !isRedirecting) {
            console.log("User authenticated, redirecting to /app");
            setIsRedirecting(true);
            
            // Small delay to prevent flash, then redirect
            setTimeout(() => {
                router.replace('/app');
            }, 100);
        }
    }, [user, loading, router, isRedirecting]);

    // Show loading state while checking auth or redirecting
    if (loading || isRedirecting) {
        return (
            <div className="login-page-container">
                <div className="login-box">
                    <FaSpinner className="fa-spin" size={50} />
                    <p>{isRedirecting ? 'Redirecting to app...' : 'Loading Authentication...'}</p>
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
                    onClick={signInWithGoogle}
                    className="login-button google-login"
                    disabled={loading}
                >
                    <FaGoogle style={{ marginRight: '10px' }} />
                    Login with Google
                </button>
                <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                    <a href="/" style={{ color: 'var(--accent-primary)' }}>Back to Home</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;