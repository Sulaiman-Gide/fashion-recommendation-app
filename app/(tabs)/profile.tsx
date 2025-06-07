import { auth, db } from "@/lib/firebase";
import { setAuthenticated, setToken } from "@/store/authSlice";
import { persistor } from "@/store/store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

import PersonAvatar from "@/assets/images/personAvatar.svg";
import Spinner from "@/assets/Lottie/appLoadingWhite.json";

export default function ProfileTabScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [authUser, setAuthUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uid = await SecureStore.getItemAsync("uid");
        if (uid) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const checkBiometrics = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricEnabled(compatible && enrolled);
    };
    checkBiometrics();
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            await persistor.purge();
            dispatch(setAuthenticated(false));
            dispatch(setToken(null));
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  }, [dispatch]);

  const handleBiometricToggle = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to enable biometric login",
    });
    if (result.success) {
      Alert.alert("Enabled", "Biometric authentication enabled.");
      setIsBiometricEnabled(true);
    } else {
      Alert.alert("Failed", "Authentication failed.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={Spinner}
          autoPlay
          loop
          style={{ width: 100, height: 100 }}
        />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <PersonAvatar width={88} height={88} />
        </View>
        <Text style={styles.nameText}>
          {userProfile?.name || authUser?.displayName || "User"}
        </Text>
        <Text style={styles.emailText}>{authUser?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={handleBiometricToggle}
        >
          <Ionicons name="finger-print" size={22} color="#444" />
          <Text style={styles.optionText}>Enable Biometric Login</Text>
          <Switch
            trackColor={{ false: "#ccc", true: "#FF6347" }}
            thumbColor={isBiometricEnabled ? "#fff" : "#eee"}
            ios_backgroundColor="#ccc"
            value={isBiometricEnabled}
            onValueChange={handleBiometricToggle}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => router.push("/EditProfile")}
        >
          <MaterialIcons name="edit" size={22} color="#444" />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionRow, styles.logoutRow]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={22} color="#ff4d4d" />
          <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 15,
    marginTop: 20,
    fontFamily: "BeVietnamPro-Regular",
    color: "#555",
  },
  headerCard: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  nameText: {
    fontSize: 20,
    fontFamily: "BeVietnamPro-Bold",
    color: "#111",
  },
  emailText: {
    fontSize: 14,
    fontFamily: "BeVietnamPro-Regular",
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "BeVietnamPro-Bold",
    color: "#333",
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "BeVietnamPro-Regular",
    color: "#222",
  },
  logoutRow: {
    backgroundColor: "#fff5f5",
    marginTop: 12,
  },
  logoutText: {
    color: "#ff4d4d",
    fontFamily: "BeVietnamPro-Bold",
  },
});
