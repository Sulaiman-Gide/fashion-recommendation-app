import CustomToast, { ToastType } from "@/components/CustomToast";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { addToCart } from "@/store/cartSlice";
import { RootState } from "@/store/store";
import { Product } from "@/types";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  // Default values for optional product properties
  const safeProduct = {
    ...product,
    stock: product?.stock ?? 0,
    sizes: product?.sizes ?? [],
    colors: product?.colors ?? [],
  };
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [likeScale] = useState(new Animated.Value(1));
  const insets = useSafeAreaInsets();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);

      // Track product view for recommendations
      if (user?.uid) {
        await supabase
          .from("user_activity")
          .upsert(
            {
              user_id: user.uid,
              product_id: id,
              last_viewed: new Date().toISOString(),
              view_count: 1,
            },
            {
              onConflict: "user_id,product_id",
              count: "exact",
            }
          )
          .select();
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: ToastType = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleLike = () => {
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setLiked((prev) => !prev);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (
      (product.sizes?.length && !selectedSize) ||
      (product.colors?.length && !selectedColor)
    ) {
      showToast("Please select all required options", "error");
      return;
    }

    // Check if product is already in cart with same options
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.id === product.id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );

    if (existingItemIndex >= 0) {
      showToast("Item quantity updated in cart");
    } else {
      showToast("Added to cart");
    }

    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images[0],
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      })
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/(tabs)/cart");
  };

  const skeletonBg = isDarkMode ? "#2a2a2a" : "#e5e7eb";
  const skeletonHighlight = isDarkMode ? "#333" : "#f3f4f6";
  const styles = getStyles(isDarkMode);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDarkMode ? "#000" : "#fff" }}
      >
        <View style={{ flex: 1, padding: 16 }}>
          {/* Main image skeleton */}
          <View
            style={{
              height: 320,
              backgroundColor: skeletonBg,
              borderRadius: 18,
              marginBottom: 24,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: skeletonHighlight,
                opacity: 0.5,
              }}
            />
          </View>

          {/* Title skeleton */}
          <View
            style={{
              height: 28,
              width: "70%",
              backgroundColor: skeletonBg,
              borderRadius: 8,
              marginBottom: 12,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: skeletonHighlight,
                opacity: 0.5,
              }}
            />
          </View>

          {/* Price skeleton */}
          <View
            style={{
              height: 20,
              width: "40%",
              backgroundColor: skeletonBg,
              borderRadius: 8,
              marginBottom: 18,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: skeletonHighlight,
                opacity: 0.5,
              }}
            />
          </View>

          {/* Description skeleton */}
          <View
            style={{
              height: 60,
              width: "100%",
              backgroundColor: skeletonBg,
              borderRadius: 8,
              marginBottom: 18,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: skeletonHighlight,
                opacity: 0.5,
              }}
            />
          </View>

          {/* Size selector skeleton */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  height: 40,
                  width: 70,
                  backgroundColor: skeletonBg,
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: skeletonHighlight,
                    opacity: 0.5,
                  }}
                />
              </View>
            ))}
          </View>

          {/* Add to cart button skeleton */}
          <View
            style={{
              height: 56,
              width: "100%",
              backgroundColor: skeletonBg,
              borderRadius: 12,
              marginTop: "auto",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: skeletonHighlight,
                opacity: 0.5,
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? "#000" : "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FF6347",
            fontSize: 18,
            fontFamily: "BeVietnamPro-Medium",
          }}
        >
          Product not found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: isDarkMode ? "#333333" : "#ffffff" }}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Main ScrollView */}

      {/* Image Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setImageIndex(idx);
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          )}
          keyExtractor={(_, idx) => idx.toString()}
        />

        {/* Carousel indicators */}
        <View style={styles.carouselIndicators}>
          {product.images.map((_: any, idx: number) => (
            <View
              key={idx}
              style={[
                styles.carouselDot,
                imageIndex === idx && styles.carouselDotActive,
              ]}
            />
          ))}
        </View>

        {/* Back button */}
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              top:
                (Platform.OS === "android"
                  ? StatusBar.currentHeight || 0
                  : insets.top) + 8,
            },
          ]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#222" />
        </TouchableOpacity>

        {/* Like button */}
        <Animated.View
          style={[
            styles.likeButton,
            {
              top:
                (Platform.OS === "android"
                  ? StatusBar.currentHeight || 0
                  : insets.top) + 8,
              transform: [{ scale: likeScale }],
            },
          ]}
        >
          <Pressable onPress={handleLike} hitSlop={10}>
            <AntDesign
              name={liked ? "heart" : "hearto"}
              size={22}
              color={liked ? "#FF6347" : "#fff"}
            />
          </Pressable>
        </Animated.View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 40 }}
      >
        {/* Product Info */}
        <View
          style={[
            styles.infoContainer,
            { backgroundColor: isDarkMode ? "#333" : "#f8f8f8" },
          ]}
        >
          {/* Brand and Name Row */}
          <View style={styles.brandRow}>
            <View style={styles.brandHeader}>
              <View style={styles.brandContainer}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={{ flex: 1, marginTop: 5, marginLeft: 5 }}>
                  <MaterialIcons name="verified" size={20} color="#16a34a" />
                </View>
              </View>

              {/* In Stock */}
              <Text
                style={[
                  styles.stockText,
                  {
                    color: (product.stock ?? 0) > 0 ? "#16a34a" : "#FF6347",
                    borderColor:
                      (product.stock ?? 0) > 0 ? "#16a34a" : "#FF6347",
                    borderWidth: 1,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 32,
                  },
                ]}
              >
                {(product.stock ?? 0) > 0
                  ? `In stock: ${product.stock}`
                  : "Out of stock"}
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              ₦
              {Number(product.price).toLocaleString("en-NG", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
            <Text style={styles.productOldPrice}>
              ₦
              {(product.price - product.price * 0.08297).toLocaleString(
                "en-NG",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </Text>
          </View>

          {/* Size Selection */}
          {(product.sizes?.length ?? 0) > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Select Size</Text>
              <View style={styles.optionContainer}>
                {(product.sizes ?? []).map((size: string) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      selectedSize === size && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedSize === size && styles.optionTextSelected,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Color Selection */}
          {(product.colors?.length ?? 0) > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Select Color</Text>
              <View style={styles.optionContainer}>
                {(product.colors ?? []).map((color: string) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderWidth: 2,
                        borderColor: "#e5e7eb80",
                      },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={[styles.sectionContainer, { marginBottom: 16 }]}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((prev) => prev + 1)}
                disabled={
                  (product.stock ?? 0) > 0 && quantity >= (product.stock ?? 1)
                }
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View
        style={[
          styles.actionRow,
          {
            backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
            borderTopColor: isDarkMode ? "#444" : "#e5e7eb",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.addToCartButton}
          activeOpacity={0.85}
          onPress={handleAddToCart}
          disabled={(product.stock ?? 0) <= 0}
        >
          <Text style={styles.addToCartText}>
            {(product.stock ?? 0) <= 0 ? "Out of Stock" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buyNowButton,
            (product.stock ?? 0) <= 0 && styles.buttonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleBuyNow}
          disabled={(product.stock ?? 0) <= 0}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      <CustomToast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      color: isDarkMode ? "#f3f4f6" : "black",
      marginTop: 16,
      marginBottom: 8,
      fontFamily: "BeVietnamPro-SemiBold",
    },
    optionContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      backgroundColor: "#f9fafb",
    },
    optionButtonSelected: {
      backgroundColor: "#000",
      borderColor: "#000",
    },
    optionText: {
      fontSize: 14,
      color: isDarkMode ? "#111111ff" : "#4b5563",
      fontFamily: "BeVietnamPro-Medium",
    },
    optionTextSelected: {
      color: "#fff",
    },
    colorOption: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: "transparent",
    },
    colorOptionSelected: {
      borderColor: isDarkMode ? "#f3f4f6" : "#222",
      transform: [{ scale: 1.1 }],
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    quantityButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#f3f4f6",
      justifyContent: "center",
      alignItems: "center",
    },
    quantityButtonText: {
      fontSize: 20,
      color: "#000",
    },
    quantityText: {
      color: isDarkMode ? "#f3f4f6" : "#222",
      marginHorizontal: 16,
      fontSize: 18,
      fontFamily: "BeVietnamPro-SemiBold",
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    carouselContainer: {
      width: "100%",
      height: height * 0.62,
      backgroundColor: isDarkMode ? "#333333" : "#ffffff",
      position: "relative",
      overflow: "hidden",
      zIndex: 1,
    },
    carouselImage: {
      width: width,
      height: 570,
    },
    carouselIndicators: {
      position: "absolute",
      bottom: 10,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      zIndex: 2,
    },
    carouselDot: {
      width: 10,
      height: 8,
      borderRadius: 4,
      backgroundColor: "rgb(196, 194, 194)",
      opacity: 0.4,
      marginHorizontal: 2,
    },
    carouselDotActive: {
      backgroundColor: "#FF6347",
      width: 25,
      opacity: 1,
    },
    backButton: {
      width: 40,
      height: 40,
      position: "absolute",
      left: 18,
      backgroundColor: "#fff",
      borderRadius: 44,
      zIndex: 10,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    likeButton: {
      width: 40,
      height: 40,
      position: "absolute",
      right: 18,
      backgroundColor: "rgba(65, 65, 65, 0.50)",
      borderRadius: 44,
      zIndex: 10,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    infoContainer: {
      backgroundColor: "#fff",
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      padding: 16,
      marginTop: -25,
      zIndex: 10,
      minHeight: height * 0.4,
    },
    brandRow: {
      gap: 15,
      marginBottom: 16,
    },
    brandHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    brandContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    sectionContainer: {
      marginBottom: 20,
    },
    productBrand: {
      fontSize: 16,
      color: isDarkMode ? "#f3f4f6" : "#222",
      fontFamily: "BeVietnamPro-Regular",
      marginRight: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    productName: {
      fontSize: 22,
      color: isDarkMode ? "#f3f4f6" : "#222",
      fontFamily: "BeVietnamPro-Regular",
      flexWrap: "wrap",
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      marginTop: -10,
      marginBottom: 12,
    },
    productPrice: {
      fontSize: 22,
      color: isDarkMode ? "#f3f4f6" : "#222",
      fontFamily: "BeVietnamPro-Regular",
    },
    productOldPrice: {
      color: isDarkMode ? "#9ca3af" : "#bbb",
      textDecorationLine: "line-through",
      fontSize: 18,
      fontFamily: "BeVietnamPro-Regular",
      marginBottom: 2,
    },
    productDescription: {
      fontSize: 15,
      color: isDarkMode ? "#d1d5db" : "#444",
      fontFamily: "BeVietnamPro-Regular",
      lineHeight: 22,
      marginTop: 4,
    },

    stockText: {
      fontSize: 16,
      fontFamily: "BeVietnamPro-Medium",
      fontWeight: "500",
      letterSpacing: 0.2,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 18,
      marginTop: 0,
    },
    tagChip: {
      backgroundColor: "#fef2f2",
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 4,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: "#FF6347",
    },
    tagText: {
      color: "#FF6347",
      fontSize: 13,
      fontFamily: "BeVietnamPro-Medium",
    },
    actionRow: {
      flexDirection: "row",
      gap: 12,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: "#fff",
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    addToCartButton: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 32,
      paddingVertical: 14,
      paddingHorizontal: 22,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#c9c9c9",
      gap: 8,
      flex: 1,
    },
    addToCartText: {
      fontSize: 17,
      fontFamily: "BeVietnamPro-Medium",
      fontWeight: "500",
      textAlign: "center",
      color: isDarkMode ? "#f3f4f6" : "#1f2937",
    },
    buyNowButton: {
      flex: 1,
      backgroundColor: "#FF6347",
      borderRadius: 32,
      paddingVertical: 14,
      paddingHorizontal: 22,
      justifyContent: "center",
    },
    buyNowText: {
      color: "#fff",
      fontSize: 17,
      fontFamily: "BeVietnamPro-Medium",
      fontWeight: "500",
      textAlign: "center",
    },
  });
