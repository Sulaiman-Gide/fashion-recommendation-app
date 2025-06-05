import { auth } from "@/lib/firebase";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function HomeTabScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {user ? (
        <>
          <Text>Welcome, {user.displayName || "User"}!</Text>
          <Text>Email: {user.email}</Text>
          <Text>UID: {user.uid}</Text>
        </>
      ) : (
        <Text>Loading user data...</Text>
      )}
    </View>
  );
}
