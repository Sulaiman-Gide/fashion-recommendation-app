import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, StyleSheet, Text } from "react-native";

interface CustomToastProps {
  message: string;
  type: "error" | "success";
  visible: boolean;
  onHide: () => void;
}

const { width } = Dimensions.get("window");

const CustomToast: React.FC<CustomToastProps> = ({
  message,
  type,
  visible,
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -50,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(onHide);
        }, 3000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  const icon = type === "success" ? "checkmark-circle" : "close-circle";
  const gradientColors: [string, string] =
    type === "error" ? ["#ff4e50", "#f9d423"] : ["#43cea2", "#185a9d"];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <LinearGradient colors={gradientColors} style={styles.toast}>
        <BlurView intensity={50} tint="light" style={styles.blurContent}>
          <Ionicons
            name={icon}
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.message}>{message}</Text>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
};

export default CustomToast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: width * 0.05,
    right: width * 0.05,
    zIndex: 1000,
    alignItems: "center",
  },
  toast: {
    borderRadius: 24,
    padding: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  blurContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 24,
    backgroundColor:
      Platform.OS === "android" ? "rgba(255,255,255,0.1)" : "transparent",
  },
  message: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "400",
    flexShrink: 1,
    fontFamily: "BeVietnamPro-Regular",
  },
});
