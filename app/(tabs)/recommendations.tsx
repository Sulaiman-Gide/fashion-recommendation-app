import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Dummy recommended products for UI
const recommendedProducts = [
  {
    id: "1",
    name: "Classic White Shirt",
    price: 12000,
    images: ["https://images.unsplash.com/photo-1512436991641-6745cdb1723f"],
    interest: 92,
  },
  {
    id: "2",
    name: "Denim Jacket",
    price: 18500,
    images: ["https://images.unsplash.com/photo-1517841905240-472988babdf9"],
    interest: 87,
  },
  {
    id: "3",
    name: "Summer Dress",
    price: 9500,
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c"],
    interest: 78,
  },
  {
    id: "4",
    name: "Leather Boots",
    price: 22000,
    images: ["https://images.unsplash.com/photo-1465101046530-73398c7f28ca"],
    interest: 81,
  },
  {
    id: "5",
    name: "Kids Hoodie",
    price: 8000,
    images: ["https://images.unsplash.com/photo-1519125323398-675f0ddb6308"],
    interest: 74,
  },
  {
    id: "6",
    name: "Sport Sneakers",
    price: 14500,
    images: ["https://images.unsplash.com/photo-1519864600265-abb23847ef2c"],
    interest: 89,
  },
];

const chunkArray = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export default function RecommendationsScreen() {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.header}>Recommended For You</Text>
        <Text style={styles.subHeader}>
          Products picked just for you. Tap to view details.
        </Text>
        <View style={styles.productsSection}>
          {chunkArray(recommendedProducts, 2).map((row, rowIndex) => (
            <View style={styles.productsRow} key={rowIndex}>
              {row.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCardGrid}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/product/${product.id}`)}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: product.images[0] }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                    <View style={styles.interestBadge}>
                      <Text style={styles.interestText}>
                        {product.interest}% match
                      </Text>
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 5 }}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productPrice}>
                        ₦
                        {Number(product.price).toLocaleString("en-NG", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {/* Fill empty space if row has only one item */}
              {row.length < 2 && <View style={styles.productCardGrid} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#f9fafb",
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 32,
    },
    header: {
      fontSize: 22,
      fontFamily: "BeVietnamPro-Bold",
      color: isDarkMode ? "#fff" : "#222",
      marginBottom: 6,
      letterSpacing: 0.2,
    },
    subHeader: {
      fontSize: 15,
      color: isDarkMode ? "#aaa" : "#555",
      fontFamily: "BeVietnamPro-Regular",
      marginBottom: 18,
    },
    productsSection: {
      marginTop: 10,
    },
    productsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 12,
    },
    productCardGrid: {
      flex: 1,
      borderRadius: 16,
      minWidth: 0,
      maxWidth: "47%",
      backgroundColor: isDarkMode ? "#18181b" : "#fff",
      marginHorizontal: 2,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 4,
    },
    imageContainer: {
      position: "relative",
    },
    productImage: {
      width: "100%",
      height: 160,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#DCDCDC40",
    },
    interestBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "#FF6347",
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 3,
      zIndex: 10,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    interestText: {
      color: "#fff",
      fontSize: 13,
      fontFamily: "BeVietnamPro-Medium",
      letterSpacing: 0.2,
    },
    productName: {
      fontSize: 15,
      fontFamily: "BeVietnamPro-Regular",
      color: isDarkMode ? "#fff" : "#222",
      marginBottom: 4,
    },
    productPriceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    productPrice: {
      fontSize: 16,
      fontFamily: "BeVietnamPro-Bold",
      color: "#FF6347",
    },
  });
