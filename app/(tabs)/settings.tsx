import { auth } from "@/lib/firebase";
import { setAuthenticated, setToken } from "@/store/authSlice";
import { persistor } from "@/store/store";
import { signOut } from "firebase/auth";
import React from "react";
import { Alert, Button, Text, View } from "react-native";
import { useDispatch } from "react-redux";

export default function SettingsTabScreen() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);

            await persistor.purge();
            dispatch(setAuthenticated(false));
            dispatch(setToken(null));
            console.log("Logged out and Redux state updated.");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings Screen</Text>
      <Button title="Logout" color="red" onPress={handleLogout} />
    </View>
  );
}
