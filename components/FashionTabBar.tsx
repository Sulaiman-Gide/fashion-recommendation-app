import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import SVGs as React components
import CartFilled from "../assets/tab-icons/cart-filled.svg";
import CartOutline from "../assets/tab-icons/cart-outline.svg";
import HomeFilled from "../assets/tab-icons/home-filled.svg";
import HomeOutline from "../assets/tab-icons/home-outline.svg";
import SettingsFilled from "../assets/tab-icons/settings-filled.svg";
import SettingsOutline from "../assets/tab-icons/settings-outline.svg";
import StarFilled from "../assets/tab-icons/star-filled.svg";
import StarOutline from "../assets/tab-icons/star-outline.svg";

const TAB_ICONS: Record<
  string,
  { focused: React.FC<any>; unfocused: React.FC<any> }
> = {
  index: {
    focused: HomeFilled,
    unfocused: HomeOutline,
  },
  recommendations: {
    focused: StarFilled,
    unfocused: StarOutline,
  },
  cart: {
    focused: CartFilled,
    unfocused: CartOutline,
  },
  profile: {
    focused: SettingsFilled,
    unfocused: SettingsOutline,
  },
};

const TAB_LABELS: Record<string, string> = {
  index: "Home",
  recommendations: "For You",
  cart: "Cart",
  settings: "Profile",
};

export function FashionTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.tabBarBg}>
        <View style={styles.tabContainer}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;
            const iconSet = TAB_ICONS[route.name];
            const IconComponent = isFocused
              ? iconSet?.focused
              : iconSet?.unfocused;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    isFocused && styles.iconWrapperActive,
                  ]}
                >
                  {IconComponent && <IconComponent width={26} height={26} />}
                </View>
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {TAB_LABELS[route.name] || label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: Platform.OS === "ios" ? 32 : 16,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    overflow: "visible",
  },
  tabBarBg: {
    backgroundColor: "#DCDCDC30",
    borderRadius: 28,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 28,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    marginHorizontal: 2,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  iconWrapperActive: {
    backgroundColor: "rgba(230,231,230,0.08)",
  },
  label: {
    fontSize: 12,
    color: "#212121",
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  labelActive: {
    color: "rgba(13, 14, 13, 0.57)",
    fontWeight: "700",
    opacity: 1,
  },
});
