import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(
    Appearance.getColorScheme() === "dark" ? "dark" : "light"
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;
    const loadTheme = async () => {
      const stored = await SecureStore.getItemAsync("theme");
      if (!ignore && (stored === "dark" || stored === "light")) {
        setTheme(stored);
      }
      setIsLoaded(true);
    };
    loadTheme();
    return () => {
      ignore = true;
    };
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await SecureStore.setItemAsync("theme", newTheme);
  };

  // Optionally, listen for system theme changes ONLY if user hasn't set a preference
  // (Uncomment if you want this feature)
  /*
  useEffect(() => {
    const listen = Appearance.addChangeListener(({ colorScheme }) => {
      SecureStore.getItemAsync("theme").then((stored) => {
        if (stored !== "dark" && stored !== "light" && (colorScheme === "dark" || colorScheme === "light")) {
          setTheme(colorScheme);
        }
      });
    });
    return () => listen.remove();
  }, []);
  */

  if (!isLoaded) {
    // Optionally, render nothing or a splash while loading theme
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, isDarkMode: theme === "dark", toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
