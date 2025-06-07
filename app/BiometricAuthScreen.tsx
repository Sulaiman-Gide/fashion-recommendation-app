import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function BiometricAuthScreen({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const authenticate = async () => {
    setLoading(true);
    setError(null);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to continue",
    });
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError("Authentication failed. Please try again.");
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.title}>Biometric Authentication</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Try Again" onPress={authenticate} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  error: { color: "red", marginBottom: 12 },
});
