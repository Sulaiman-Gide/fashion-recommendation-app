import CustomToast from "@/components/CustomToast";
import { auth, db } from "@/lib/firebase";
import { setAuthenticated, setToken } from "@/store/authSlice";
import { persistor } from "@/store/store";
import * as SecureStore from "expo-secure-store";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useDispatch } from "react-redux";

export default function HomeTabScreen() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const dispatch = useDispatch();

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
        setToastMessage("Error connecting to server. Logging out...");
        setToastVisible(true);
        setTimeout(async () => {
          try {
            await signOut(auth);
            await persistor.purge();
            dispatch(setAuthenticated(false));
            dispatch(setToken(null));
          } catch (logoutErr) {
            console.error("Logout error:", logoutErr);
          }
        }, 3000);
      }
    };

    fetchUserProfile();
  }, [dispatch]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <CustomToast
        message={toastMessage}
        type="error"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
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
