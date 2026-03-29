"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFirebaseAnalytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

export default function FirebaseAnalytics() {
  const pathname = usePathname();

  // Initialize analytics on mount
  useEffect(() => {
    getFirebaseAnalytics();
  }, []);

  // Log page views on route change
  useEffect(() => {
    async function logPageView() {
      const analytics = await getFirebaseAnalytics();
      if (analytics) {
        logEvent(analytics, "page_view", {
          page_path: pathname,
        });
      }
    }
    logPageView();
  }, [pathname]);

  return null;
}
