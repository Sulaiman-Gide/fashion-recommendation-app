import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

import { FashionTabBar } from "@/components/FashionTabBar";
import { Colors } from "@/constants/Colors";
import { ThemeProvider } from "@/context/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/(auth)");
    }
  }, [mounted, isAuthenticated, router]);

  return mounted ? (
    <ThemeProvider>
      <Tabs
        tabBar={(props) => <FashionTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="recommendations"
          options={{
            title: "Recommendations",
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
        <Tabs.Screen
          name="editProfile"
          options={{
            title: "Profile",
            tabBarButton: () => null,
          }}
        />
      </Tabs>
    </ThemeProvider>
  ) : null;
}
