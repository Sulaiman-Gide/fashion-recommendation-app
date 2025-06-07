import { db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const [loading, setLoading] = useState(true);

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
    if (!name.trim()) return Alert.alert("Validation", "Name is required.");
    if (age && (isNaN(Number(age)) || Number(age) <= 0)) {
      return Alert.alert("Validation", "Enter a valid age.");
    }

    const uid = await SecureStore.getItemAsync("uid");
    if (!uid) return;

    try {
      await updateDoc(doc(db, "users", uid), {
        name: name.trim(),
        age: age ? Number(age) : null,
        bio: bio.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      Alert.alert("Success", "Profile updated successfully.");
      router.back();
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Something went wrong while updating.");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
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

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    fontSize: 22,
    fontFamily: "BeVietnamPro-Bold",
    marginBottom: 22,
    color: "#333",
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
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  field: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: "BeVietnamPro-Medium",
    color: "#444",
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
