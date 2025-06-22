"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

const LoginPage = () => {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();

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

        if (user && !loading) {
            // If user is logged in and we are on the login page, redirect them to app
            console.log("User logged in on LoginPage, redirecting to /app");
            router.push('/app');
        }
    }, [user, loading, router]);

    // Handle initial loading state from useAuth or after triggering signInWithGoogle
    if (loading && !user) {
        return (
            <div className="login-page-container">
                <div className="login-box">
                    <FaSpinner className="fa-spin" size={50} />
                    <p>Loading Authentication...</p>
                </div>
            </div>
        );
    }

    // This UI is primarily for when the user is not logged in and auth is not loading.
    return (
        <div className="login-page-container">
            <div className="login-box">
                <h2>Welcome to Project Theta</h2>
                <p>Please log in to continue.</p>
                <button
                    onClick={signInWithGoogle}
                    className="login-button google-login"
                    disabled={loading} // 'loading' is true during Google sign-in process
                >
                    <FaGoogle style={{ marginRight: '10px' }} />
                    {loading ? 'Processing...' : 'Login with Google'}
                </button>
                {/* You can add more login options or a link to the landing page here */}
                <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                    <a href="/" style={{ color: 'var(--accent-primary)' }}>Back to Home</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;