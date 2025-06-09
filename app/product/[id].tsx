import { db } from "@/lib/firebase";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
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

const { width, height } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeScale] = useState(new Animated.Value(1));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1, padding: 0 }}>
          <View
            style={{
              height: 320,
              backgroundColor: "#e5e7eb",
              borderRadius: 18,
              marginBottom: 24,
            }}
          />
          <View
            style={{
              height: 28,
              width: 180,
              backgroundColor: "#e5e7eb",
              borderRadius: 8,
              marginBottom: 12,
            }}
          />
          <View
            style={{
              height: 20,
              width: 100,
              backgroundColor: "#e5e7eb",
              borderRadius: 8,
              marginBottom: 18,
            }}
          />
          <View
            style={{
              height: 16,
              width: 80,
              backgroundColor: "#e5e7eb",
              borderRadius: 8,
              marginBottom: 18,
            }}
          />
          <View
            style={{
              height: 60,
              width: "100%",
              backgroundColor: "#e5e7eb",
              borderRadius: 8,
              marginBottom: 18,
            }}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  height: 32,
                  width: 70,
                  backgroundColor: "#e5e7eb",
                  borderRadius: 16,
                }}
              />
            ))}
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
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FF6347", fontSize: 18 }}>
          Product not found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
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

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Brand and Name Row */}
          <View style={styles.brandRow}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <MaterialIcons name="verified" size={16} color="#16a34a" />
              </View>

              {/* In Stock */}
              <Text
                style={[
                  styles.stockText,
                  {
                    color: product.stock > 0 ? "#16a34a" : "#FF6347",
                    borderColor: product.stock > 0 ? "#16a34a" : "#FF6347",
                    borderWidth: 1,
                    paddingVertical: 7,
                    paddingHorizontal: 10,
                    borderRadius: 32,
                  },
                ]}
              >
                {product.stock > 0
                  ? `In stock: ${product.stock}`
                  : "Out of stock"}
              </Text>
            </View>
            <Text style={styles.productName}>{product.name}</Text>
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
              ₦{(product.price - product.price * 0.08297).toFixed(2)}
            </Text>
          </View>
          {/* Description */}
          <Text
            style={{
              fontSize: 18,
              color: "black",
              marginTop: 3,
              marginBottom: 6,
              fontFamily: "BeVietnamPro-Regular",
              lineHeight: 22,
            }}
          >
            Description
          </Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.addToCartButton}
              activeOpacity={0.85}
              // onPress={...}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyNowButton}
              activeOpacity={0.85}
              // onPress={...}
            >
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    width: "100%",
    height: height * 0.62,
    backgroundColor: "#18181b",
    position: "relative",
    overflow: "hidden",
    zIndex: 1,
    borderWidth: 2,
  },
  carouselImage: {
    width: width,
    height: 550,
  },
  carouselIndicators: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    zIndex: 2,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",

    opacity: 0.4,
    marginHorizontal: 2,
  },
  carouselDotActive: {
    backgroundColor: "#FF6347",
    width: 18,
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
    position: "relative",
    marginTop: -25,
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    minHeight: 320,
    height: height * 0.38,
    zIndex: 10,
    overflow: "hidden",
  },
  brandRow: {
    gap: 15,
    marginVertical: 6,
  },
  productBrand: {
    fontSize: 16,
    color: "#222",
    fontFamily: "BeVietnamPro-Regular",
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  productName: {
    fontSize: 22,
    color: "#222",
    fontFamily: "BeVietnamPro-Regular",
    flex: 1,
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
    color: "#222",
    fontFamily: "BeVietnamPro-Regular",
  },
  productOldPrice: {
    color: "#bbb",
    textDecorationLine: "line-through",
    fontSize: 18,
    fontFamily: "BeVietnamPro-Regular",
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 15,
    color: "#444",
    marginBottom: 18,
    fontFamily: "BeVietnamPro-Regular",
    lineHeight: 22,
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
    marginTop: 8,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    paddingBottom: 0,
    paddingTop: 15,
    borderTopColor: "#e5e7eb",
    borderTopWidth: 1,
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
    color: "#21212199",
    fontSize: 17,
    fontFamily: "BeVietnamPro-Medium",
    fontWeight: "500",
    textAlign: "center",
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
