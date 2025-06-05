import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AuthNavigator from "../navigation/AuthNavigator";

export default function AuthLayout() {
  const { isAuthenticated, hasSeenOnboarding } = useSelector(
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

  const initialRoute = hasSeenOnboarding ? "Login" : "Onboarding";

  return mounted ? <AuthNavigator initialRouteName={initialRoute} /> : null;
}
