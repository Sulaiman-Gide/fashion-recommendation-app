import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AuthNavigator from "../navigation/AuthNavigator";

export default function AuthLayout() {
  const { isAuthenticated, hasSeenOnboarding, isAuthReady } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthReady) {
    return null;
  }

  if (isAuthenticated) {
    // Don't render anything if authenticated, navigation will handle redirect
    return null;
  }

  const initialRoute = hasSeenOnboarding ? "Login" : "Onboarding";

  return <AuthNavigator initialRouteName={initialRoute} />;
}
