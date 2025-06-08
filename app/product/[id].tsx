import { db } from "@/lib/firebase";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

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

  if (loading) {
    // Skeleton loader
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1, padding: 20 }}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
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
          <Text style={styles.productDescription}>{product.description}</Text>
          {/* Tags */}
          <View style={styles.tagsRow}>
            {product.tags?.map((tag: string) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {/* Stock */}
          <Text style={styles.stockText}>
            {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
          </Text>
          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            activeOpacity={0.85}
            // onPress={...} // Implement your add to cart logic here
          >
            <AntDesign name="shoppingcart" size={20} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    width: "100%",
    height: 320,
    backgroundColor: "#f5f5f5",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 18,
    position: "relative",
  },
  carouselImage: {
    width: width,
    height: 320,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  carouselIndicators: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 2,
  },
  carouselDotActive: {
    backgroundColor: "#FF6347",
    width: 18,
  },
  backButton: {
    position: "absolute",
    top: 18,
    left: 18,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    minHeight: 300,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
    fontFamily: "BeVietnamPro-Bold",
  },
  productBrand: {
    fontSize: 15,
    color: "#FF6347",
    fontFamily: "BeVietnamPro-Medium",
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6347",
    fontFamily: "BeVietnamPro-Bold",
  },
  productOldPrice: {
    fontSize: 16,
    color: "#bbb",
    textDecorationLine: "line-through",
    fontFamily: "BeVietnamPro-Regular",
  },
  productDescription: {
    fontSize: 16,
    color: "#444",
    marginBottom: 18,
    fontFamily: "BeVietnamPro-Regular",
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  tagChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: "#FF6347",
    fontSize: 13,
    fontFamily: "BeVietnamPro-Medium",
  },
  stockText: {
    fontSize: 15,
    color: "#16a34a",
    marginBottom: 18,
    fontFamily: "BeVietnamPro-Regular",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6347",
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
    shadowColor: "#FF6347",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "BeVietnamPro-SemiBold",
  },
});
