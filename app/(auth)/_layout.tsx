import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import BiometricAuthScreen from "../BiometricAuthScreen";
import AuthNavigator from "../navigation/AuthNavigator";

export default function AuthLayout() {
  const { isAuthenticated, hasSeenOnboarding, isAuthReady } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [biometricChecked, setBiometricChecked] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check biometric preference if authenticated
  useEffect(() => {
    const checkBiometric = async () => {
      if (mounted && isAuthenticated) {
        const biometricEnabled = await SecureStore.getItemAsync(
          "biometricEnabled"
        );
        if (biometricEnabled === "true") {
          setShowBiometric(true);
        } else {
          router.replace("/(tabs)");
        }
      }
      setBiometricChecked(true);
    };
    checkBiometric();
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthReady || (isAuthenticated && !biometricChecked)) {
    return null;
  }

  if (isAuthenticated) {
    if (showBiometric) {
      return (
        <BiometricAuthScreen
          onSuccess={() => {
            setShowBiometric(false);
            router.replace("/(tabs)");
          }}
        />
      );
    }
    // If not showing biometric, navigation will handle redirect
    return null;
  }

  const initialRoute = hasSeenOnboarding ? "Login" : "Onboarding";
  return <AuthNavigator initialRouteName={initialRoute} />;
}
