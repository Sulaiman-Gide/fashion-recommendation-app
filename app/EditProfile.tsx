import CustomToast from "@/components/CustomToast";
import { db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const uid = await SecureStore.getItemAsync("uid");
      if (uid) {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || "");
          setAge(data.age?.toString() || "");
          setBio(data.bio || "");
          setPhoneNumber(data.phoneNumber || "");
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return showToast("Name is required.", "error");
    if (age && (isNaN(Number(age)) || Number(age) <= 0)) {
      return showToast("Enter a valid age.", "error");
    }

    const uid = await SecureStore.getItemAsync("uid");
    if (!uid) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, "users", uid), {
        name: name.trim(),
        age: age ? Number(age) : null,
        bio: bio.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      showToast("Profile updated successfully.", "success");
      setSaving(false);
      setTimeout(() => {
        setSaving(false);
        router.navigate("/(tabs)/profile");
      }, 3000);
    } catch (err) {
      console.log("Error updating profile:", err);
      setSaving(false);
      showToast("Something went wrong while updating.", "error");
    }
  };

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
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity
            onPress={() => router.navigate("/(tabs)/profile")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Edit Profile</Text>

          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Age */}
          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
            />
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.label}>Short Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.input, styles.bioInput]}
              placeholder="Write a short bio"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Updating..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "BeVietnamPro-Medium",
    fontWeight: "500",
    marginBottom: 22,
    color: "#212121",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  field: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: "BeVietnamPro-Medium",
    color: "#212121",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    fontSize: 16,
    fontFamily: "BeVietnamPro-Regular",
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "BeVietnamPro-Bold",
    fontSize: 16,
  },
});
