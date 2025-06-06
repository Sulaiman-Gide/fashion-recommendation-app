import PersonAvatar from "@/assets/images/personAvatar.svg";
import CustomToast from "@/components/CustomToast";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/lib/firebase";
import { setAuthenticated, setToken } from "@/store/authSlice";
import { persistor } from "@/store/store";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Device from "expo-device";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

export default function ProfileTabScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [authUser, setAuthUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

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
      setIsBiometricAvailable(compatible && enrolled);

      // Restore user's preference from SecureStore
      const biometricPref = await SecureStore.getItemAsync("biometricEnabled");
      setIsBiometricEnabled(biometricPref === "true");
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

  const handleBiometricToggle = async (value: boolean) => {
    const isSimulator = Platform.OS === "ios" && !Device.isDevice;

    if (value) {
      if (!isBiometricAvailable && !isSimulator) {
        setToastMessage(
          "Biometric authentication is not available or not enrolled on this device."
        );
        setToastType("error");
        setToastVisible(true);
        return;
      }
      if (isSimulator) {
        setIsBiometricEnabled(true);
        await SecureStore.setItemAsync("biometricEnabled", "true");
        setToastMessage("Simulated biometric success.");
        setToastType("success");
        setToastVisible(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
      });

      if (result.success) {
        setIsBiometricEnabled(true);
        await SecureStore.setItemAsync("biometricEnabled", "true");
        setToastMessage("Biometric authentication enabled.");
        setToastType("success");
        setToastVisible(true);
      } else {
        setToastMessage("Authentication failed.");
        setToastType("error");
        setToastVisible(true);
      }
    } else {
      setIsBiometricEnabled(false);
      await SecureStore.setItemAsync("biometricEnabled", "false");
      setToastMessage("Biometric login disabled.");
      setToastType("success");
      setToastVisible(true);
    }
  };
  const styles = getStyles(isDarkMode);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <>
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
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

          {/* Biometric Toggle */}
          <View style={styles.optionRow}>
            <Ionicons name="finger-print" size={22} color="#444" />
            <Text style={styles.optionText}>Enable Biometric Login</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF6347" }}
              thumbColor={isBiometricEnabled ? "#fff" : "#eee"}
              ios_backgroundColor="#ccc"
              value={isBiometricEnabled}
              onValueChange={handleBiometricToggle}
            />
          </View>

          <View style={styles.optionRow}>
            <Ionicons
              name="moon"
              size={22}
              color={isDarkMode ? "#eee" : "#444"}
            />
            <Text
              style={[
                styles.optionText,
                { color: isDarkMode ? "#eee" : "#222" },
              ]}
            >
              Dark Mode
            </Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#444" }}
              thumbColor={isDarkMode ? "#fff" : "#eee"}
              ios_backgroundColor="#ccc"
              value={isDarkMode}
              onValueChange={toggleTheme}
            />
          </View>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => router.push("/editProfile")}
          >
            <MaterialCommunityIcons
              name="account-edit"
              size={24}
              color="#444"
            />
            <Text style={styles.optionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionRow, styles.logoutRow]}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={23} color="#ff4d4d" />
            <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#f9fafb",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#000" : "#fff",
    },
    headerCard: {
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: isDarkMode ? "#111" : "#fff",
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
      backgroundColor: isDarkMode ? "#222" : "#f0f0f0",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    nameText: {
      fontSize: 20,
      fontFamily: "BeVietnamPro-Medium",
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#111",
    },
    emailText: {
      fontSize: 15,
      fontFamily: "BeVietnamPro-Regular",
      color: isDarkMode ? "#aaa" : "#666",
      marginTop: 4,
    },
    section: {
      marginTop: 20,
      paddingHorizontal: 20,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 15,
      fontFamily: "BeVietnamPro-Medium",
      fontWeight: "600",
      color: isDarkMode ? "#eee" : "#333",
      marginBottom: 8,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
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
      color: isDarkMode ? "#eee" : "#222",
    },
    logoutRow: {
      backgroundColor: isDarkMode ? "#331111" : "#fff5f5",
      marginTop: 12,
    },
    logoutText: {
      fontSize: 17,
      color: "#ff4d4d",
      fontFamily: "BeVietnamPro-Medium",
      fontWeight: "500",
    },
  });
