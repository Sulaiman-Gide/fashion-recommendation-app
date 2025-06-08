import { ThemeProvider } from "@/context/ThemeContext";
import { useFirebaseAuthListener } from "@/hooks/useFirebaseAuthListener";
import { rehydrate } from "@/store/authSlice";
import { persistor, store } from "@/store/store";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import SplashScreenComponent from "./SplashScreen";

function AppContent() {
  useFirebaseAuthListener();
  return <Slot />;
}

function PersistGateWrapper({ children }: { children: React.ReactNode }) {
  const [rehydrated, setRehydrated] = useState(false);
  const { dispatch } = store;

  return (
    <PersistGate
      loading={
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      }
      persistor={persistor}
      onBeforeLift={() => {
        dispatch(rehydrate());
        setRehydrated(true);
      }}
    >
      {children}
    </PersistGate>
  );
}

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
      <PersistGateWrapper>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </PersistGateWrapper>
    </Provider>
  );
}
