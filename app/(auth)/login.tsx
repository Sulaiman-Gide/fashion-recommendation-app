import CustomToast from "@/components/CustomToast";
import { Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { setAuthenticated, setToken } from "../../store/authSlice";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const router = useRouter();
  const animation = useRef<LottieView>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"error" | "success">("error");
  const dispatch = useDispatch();

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleLogin = useCallback(async () => {
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      dispatch(setAuthenticated(true));
      dispatch(setToken(await user.getIdToken()));

      setToastMessage("Login successful.");
      setToastType("success");
      setToastVisible(true);

      router.replace("/(tabs)");
    } catch (error: any) {
      //console.error("Login error:", error);

      let message = "Login failed. Please try again.";

      if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/invalid-credential") {
        message = "Invalid login credential. Please check & retry again";
      } else if (error.code === "auth/network-request-failed") {
        message = "Network error. Please check your connection.";
      }

      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);

      dispatch(setAuthenticated(false));
      dispatch(setToken(null));
    } finally {
      setIsLoading(false);
    }
  }, [email, password, dispatch, router]);

  const isButtonDisabled = useMemo(() => {
    return !email || password.length < 3;
  }, [email, password]);

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <StatusBar style="light" />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ImageBackground
            source={require("@/assets/images/photo-5.jpg")}
            style={styles.background}
            resizeMode="cover"
          >
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
              <View style={styles.formContainer}>
                <Text style={styles.headerText}>Login</Text>
                <Text style={styles.subHeaderText}>
                  Sign in to see what’s new — just for you.
                </Text>

                <View style={styles.inputContainer}>
                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Email address</Text>
                    <View style={styles.inputWrapper}>
                      <Fontisto name="email" size={17} color="#000" />
                      <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={(text) => {
                          const updatedEmail =
                            text.charAt(0).toLowerCase() + text.slice(1);
                          setEmail(updatedEmail);
                        }}
                        placeholder="e.g example@gmail.com"
                        placeholderTextColor="#979999"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <Fontisto name="locked" size={15} color="black" />
                      <TextInput
                        style={styles.textInput}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="********"
                        placeholderTextColor="#979999"
                      />
                      <MaterialCommunityIcons
                        name={showPassword ? "eye-off" : "eye"}
                        size={17}
                        color="#000"
                        onPress={toggleShowPassword}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      {
                        backgroundColor: isButtonDisabled ? "#ccc" : "#FF6347",
                      },
                    ]}
                    onPress={handleLogin}
                    disabled={isButtonDisabled}
                  >
                    {isLoading ? (
                      <LottieView
                        autoPlay
                        ref={animation}
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: "transparent",
                        }}
                        source={require("@/assets/Lottie/appLoadingWhite.json")}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.loginButtonText,
                          { color: isButtonDisabled ? "#1f1e1e" : "white" },
                        ]}
                      >
                        Login
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.navigate("/(auth)/signup")}
                    style={styles.signupContainer}
                  >
                    <Text style={styles.signupText}>
                      Don't have an account?{" "}
                      <Text style={styles.signupLink}>Sign Up</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <CustomToast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  formContainer: {
    flex: 0.6,
    backgroundColor: "white",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 70,
    paddingHorizontal: 14,
    paddingVertical: 20,
    paddingTop: 30,
  },

  headerText: {
    color: "#292626",
    fontWeight: "500",
    fontSize: 25,
  },
  subHeaderText: {
    marginTop: 14,
    color: "#202020",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "BeVietnamPro-Regular",
  },
  inputContainer: {
    flex: 1,
    width: "100%",
    marginTop: 20,
    marginBottom: 48,
  },
  inputSection: {
    marginVertical: 12,
  },
  inputLabel: {
    color: "#595959",
    fontSize: 14,
    marginBottom: 10,
    fontFamily: "BeVietnamPro-Regular",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 32,
    marginVertical: 14,
  },
  loginButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "interSemiBold",
  },
  signupContainer: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  signupText: {
    textAlign: "center",
    color: "#595959",
    fontSize: 16,
  },
  signupLink: {
    marginBottom: -3,
    color: "#F94700",
    textDecorationLine: "underline",
  },
});
