"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // If user is authenticated and we haven't redirected yet, redirect to app
    if (user && !loading && !hasRedirected) {
      console.log('Home page: User authenticated, redirecting to app');
      setHasRedirected(true);
      router.replace('/app');
    }
  }, [user, loading, router, hasRedirected]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return <LandingPage />;
}