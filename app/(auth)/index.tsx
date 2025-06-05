import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

export default function OnboardingScreen({ navigation }: any) {
  const dispatch = useDispatch();

  const completeOnboarding = () => {
    //dispatch(setHasSeenOnboarding(true)); //hides onboarding screen in future
    navigation.navigate("Login");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/photo-2.jpg")}
      style={styles.background}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.03)",
          "rgba(0, 0, 0, 0.06)",
          "rgba(0, 0, 0, 0.91)",
        ]}
        style={styles.overlay}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.titlePrimary}>Find Your Look</Text>
          <Text style={styles.titleSecondary}>Feel Confident Every Day</Text>
          <Text style={styles.titleTagline}>
            Style picks made just for you, based on what you love.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={completeOnboarding}>
          <Pressable style={styles.buttonInner}>
            <Text style={styles.buttonText}>Discover more</Text>
          </Pressable>
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: "12%",
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 50,
    marginBottom: 30,
  },
  titlePrimary: {
    fontSize: 36,
    fontWeight: "600",
    color: "#fff",
  },
  titleSecondary: {
    fontSize: 30,
    fontWeight: "600",
    color: "#fefefe",
    marginTop: 8,
  },
  titleTagline: {
    fontSize: 18,
    color: "#fefefe",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 24,
  },
  button: {
    width: "100%",
    backgroundColor: "#F94700",
    paddingHorizontal: 30,
    paddingVertical: 23,
    borderRadius: 50,
    marginTop: 30,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "BeVietnamPro-Regular",
  },
});
