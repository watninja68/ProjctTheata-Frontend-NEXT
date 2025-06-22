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

        // Only redirect if we have a user and we're not loading
        if (user && !loading) {
            console.log("User logged in on LoginPage, redirecting to /app");
            // Use replace to avoid back button issues
            router.replace('/app');
        }
    }, [user, loading, router]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="login-page-container">
                <div className="login-box">
                    <FaSpinner className="fa-spin" size={50} />
                    <p>Loading Authentication...</p>
                </div>
            </div>
        );
    }

    // If user is authenticated, show a brief message before redirect
    if (user) {
        return (
            <div className="login-page-container">
                <div className="login-box">
                    <FaSpinner className="fa-spin" size={50} />
                    <p>Redirecting to app...</p>
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
                    {loading ? 'Processing...' : 'Login with Google'}
                </button>
                <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                    <a href="/" style={{ color: 'var(--accent-primary)' }}>Back to Home</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;