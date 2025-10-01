import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_GAP = 10;
const CARD_WIDTH = (width - 18 * 2 - CARD_GAP) / 2;

const chunkArray = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export default function RecommendationsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const styles = getStyles(isDarkMode);

  useEffect(() => {
    if (user) {
      fetchPersonalizedRecommendations();
    }
  }, [user]);

  // Personalized recommendation logic
  const fetchPersonalizedRecommendations = async () => {
    try {
      setLoading(true);
      // 1. Fetch recent activity (views and purchases)
      const { data: activity } = await supabase
        .from("activity")
        .select("products, status")
        .eq("user_id", user?.uid)
        .order("created_at", { ascending: false })
        .limit(30);

      // 2. Count category and product frequency
      let viewedProductIds: string[] = [];
      let purchasedProductIds: string[] = [];
      if (activity) {
        for (const act of activity) {
          const ids = (act.products || []).map((p: any) => p.id);
          if (act.status === "success") purchasedProductIds.push(...ids);
          else if (act.status === "view") viewedProductIds.push(...ids);
        }
      }

      // 3. Get categories of viewed/purchased products
      const allProductIds = Array.from(
        new Set([...viewedProductIds, ...purchasedProductIds])
      );
      let categoryCount: Record<string, number> = {};
      if (allProductIds.length) {
        const { data: productsMeta } = await supabase
          .from("products")
          .select("id, category")
          .in("id", allProductIds);
        productsMeta?.forEach((p) => {
          if (p.category)
            categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        });
      }
      const sortedCategories = Object.keys(categoryCount).sort(
        (a, b) => categoryCount[b] - categoryCount[a]
      );

      // 4. Recommend products from top categories, not already purchased
      let recommended: any[] = [];
      if (sortedCategories.length) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .in("category", sortedCategories)
          .not("id", "in", purchasedProductIds)
          .order("view_count", { ascending: false })
          .limit(12);
        recommended = data || [];
      }

      // 5. Fallback: trending products
      if (!recommended.length) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .order("view_count", { ascending: false })
          .limit(12);
        recommended = data || [];
      }

      // 6. Add matchScore for UI
      recommended = recommended.map((p) => ({
        ...p,
        matchScore:
          p.category && categoryCount[p.category]
            ? Math.min(100, 60 + categoryCount[p.category] * 10)
            : 50,
      }));
      setProducts(recommended);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading recommendations...</Text>
      </View>
    );
  }

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: product.images?.[0] || "https://via.placeholder.com/300",
          }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {product.matchScore && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{product.matchScore}% match</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>
            ₦{product.price.toLocaleString("en-NG")}
          </Text>
          <Text style={styles.productOldPrice}>
            ₦{(product.price - product.price * 0.08297).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Recommended For You</Text>
          <Text style={styles.subHeader}>
            {products.length > 0
              ? "Products picked just for you. Tap to view details."
              : "View more products to see personalized recommendations."}
          </Text>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No recommendations yet. Start browsing to see personalized
              suggestions.
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => renderProductCard(product))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#f9fafb",
      paddingTop: 40,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#000" : "#f9fafb",
      padding: 20,
    },
    loadingText: {
      color: isDarkMode ? "#fff" : "#000",
      marginTop: 12,
      fontFamily: "BeVietnamPro-Regular",
      fontSize: 14,
    },
    scrollViewContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
    },
    headerContainer: {
      marginBottom: 20,
    },
    header: {
      fontSize: 24,
      fontFamily: "BeVietnamPro-Bold",
      color: isDarkMode ? "#fff" : "#111",
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    subHeader: {
      fontSize: 15,
      fontFamily: "BeVietnamPro-Regular",
      color: isDarkMode ? "#aaa" : "#666",
      lineHeight: 22,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyText: {
      color: isDarkMode ? "#aaa" : "#666",
      fontFamily: "BeVietnamPro-Regular",
      fontSize: 15,
      textAlign: "center",
      lineHeight: 22,
    },
    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginHorizontal: -CARD_GAP / 2,
    },
    productCard: {
      width: CARD_WIDTH,
      backgroundColor: isDarkMode ? "#18181b" : "#fff",
      marginBottom: 16,
      overflow: "hidden",
    },
    imageContainer: {
      position: "relative",
      aspectRatio: 0.9,
      backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
    },
    productImage: {
      width: "100%",
      height: "100%",
    },
    matchBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    matchText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "BeVietnamPro-Medium",
      letterSpacing: 0.2,
    },
    productInfo: {
      padding: 12,
    },
    productName: {
      fontSize: 14,
      fontFamily: "BeVietnamPro-Regular",
      color: isDarkMode ? "#f0f0f0" : "#333",
      marginBottom: 4,
      lineHeight: 18,
    },
    productPriceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    productPrice: {
      fontSize: 16,
      fontFamily: "BeVietnamPro-Bold",
      color: "#FF6347",
    },
    productOldPrice: {
      fontSize: 13,
      fontFamily: "BeVietnamPro-Regular",
      color: isDarkMode ? "#888" : "#bbb",
      textDecorationLine: "line-through",
    },
  });
