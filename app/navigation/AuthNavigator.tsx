import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import OnboardingScreen from "../(auth)";
import LoginScreen from "../(auth)/login";
import SignupScreen from "../(auth)/signup";
import ForgotPasswordScreen from "../(auth)/forgotPassword";

const Stack = createStackNavigator();

interface AuthNavigatorProps {
  initialRouteName: string;
}

export default function AuthNavigator({
  initialRouteName,
}: AuthNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
