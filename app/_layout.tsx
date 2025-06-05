import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import React, { useState } from "react";
import { Provider } from "react-redux";
import store from "../store/store";
import SplashScreenComponent from "./SplashScreen";
import AuthStateListener from "./_authStateListener";

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "BeVietnamPro-Regular": require("../assets/fonts/BeVietnamPro-Regular.ttf"),
    "BeVietnamPro-Bold": require("../assets/fonts/BeVietnamPro-Bold.ttf"),
    "sofiaPro-Light": require("../assets/fonts/sofiapro-light.otf"),
    "sofiaPro-Bold": require("../assets/fonts/SofiaProBold.ttf"),
    "Laila-Medium": require("../assets/fonts/Laila-Medium.ttf"),
    "Laila-SemiBold": require("../assets/fonts/Laila-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  const handleSplashFinish = () => setAppReady(true);

  if (!appReady) {
    return <SplashScreenComponent onFinish={handleSplashFinish} />;
  }

  return (
    <Provider store={store}>
      <AuthStateListener />
      <Slot />
    </Provider>
  );
}
