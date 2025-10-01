import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text } from "react-native";

export type ToastType = "error" | "success";

interface CustomToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide?: () => void;
  onDismiss?: () => void;
}

const { width } = Dimensions.get("window");

const CustomToast: React.FC<CustomToastProps> = ({
  message,
  type,
  visible,
  onHide = () => {},
  onDismiss = () => {},
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (!visible) {
      onDismiss();
      return;
    }

    // Show animation
    Animated.parallel([
      Animated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      hideToast();
    }, 3000);

    return () => clearTimeout(timer);

    function hideToast() {
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
      ]).start(() => {
        onHide();
        onDismiss();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const icon = type === "success" ? "checkmark-circle" : "close-circle";
  const bgColor = type === "success" ? "#27ae60" : "#e74c3c";

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
      <Animated.View style={[styles.toast, { backgroundColor: bgColor }]}>
        <Ionicons
          name={icon}
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  message: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "400",
    flexShrink: 1,
    fontFamily: "BeVietnamPro-Regular",
  },
});
