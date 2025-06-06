import { auth, db } from "@/lib/firebase";
import * as SecureStore from "expo-secure-store";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function HomeTabScreen() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setAuthUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log("Fetching user profile...");
      try {
        const uid = await SecureStore.getItemAsync("uid");
        if (uid) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {authUser && userProfile ? (
        <>
          <Text>
            Welcome, {userProfile?.name || authUser.displayName || "User"}!
          </Text>
          <Text>Email: {authUser.email}</Text>
          <Text>UID: {authUser.uid}</Text>
        </>
      ) : (
        <Text>Loading user data...</Text>
      )}
    </View>
  );
}
