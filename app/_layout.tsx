import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../store/store";
import SplashScreenComponent from "./SplashScreen";

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
      <PersistGate
        loading={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
          </View>
        }
        persistor={persistor}
      >
        <Slot />
      </PersistGate>
    </Provider>
  );
}
