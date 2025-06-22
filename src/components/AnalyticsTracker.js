"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ReactGA4 from "react-ga4";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const AnalyticsTracker = () => {
  const pathname = usePathname();

  // Effect for initialization (runs once on mount)
  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      if (!ReactGA4.isInitialized) {
        ReactGA4.initialize(GA_MEASUREMENT_ID);
      }
    } else {
      console.warn(
        "Google Analytics Measurement ID (NEXT_PUBLIC_GA_MEASUREMENT_ID) is not set. Tracking will be disabled.",
      );
    }
  }, []);

  // Effect for tracking page views (runs on pathname change after initialization)
  useEffect(() => {
    if (GA_MEASUREMENT_ID && ReactGA4.isInitialized && pathname) {
      ReactGA4.send({
        hitType: "pageview",
        page: pathname,
        title: document.title,
      });
      console.log(`GA Pageview Sent: ${pathname}`);
    }
  }, [pathname]);

  return null;
};

export default AnalyticsTracker;