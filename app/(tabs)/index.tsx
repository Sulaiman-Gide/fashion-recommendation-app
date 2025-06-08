import CartIcon from "@/assets/images/cart.svg";
import FilterIcon from "@/assets/images/filter.svg";
import PersonAvatar from "@/assets/images/personAvatar.svg";
import CustomToast from "@/components/CustomToast";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/lib/firebase";
import { setAuthenticated, setToken } from "@/store/authSlice";
import { persistor } from "@/store/store";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const chunkArray = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export default function HomeTabScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("00:00:00");
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  // Skeleton loader for product cards
  const ProductSkeleton = () => (
    <View style={styles.productCardGrid}>
      <View style={[styles.productImage, { backgroundColor: "#e5e7eb" }]} />
      <View style={{ paddingHorizontal: 5 }}>
        <View
          style={{
            height: 16,
            width: "70%",
            backgroundColor: "#e5e7eb",
            borderRadius: 4,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            height: 14,
            width: "40%",
            backgroundColor: "#e5e7eb",
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <View style={{ flexDirection: "row", gap: 6 }}>
          <View
            style={{
              height: 14,
              width: 40,
              backgroundColor: "#e5e7eb",
              borderRadius: 4,
            }}
          />
          <View
            style={{
              height: 14,
              width: 30,
              backgroundColor: "#e5e7eb",
              borderRadius: 4,
            }}
          />
        </View>
      </View>
    </View>
  );

  // Skeleton for greeting/header
  const GreetingSkeleton = () => (
    <View style={styles.topContainer}>
      <View style={styles.row}>
        <View
          style={[styles.avatarContainer, { backgroundColor: "#e5e7eb" }]}
        />
        <View style={styles.greetingColumn}>
          <View
            style={{
              height: 15,
              width: 100,
              backgroundColor: "#e5e7eb",
              borderRadius: 4,
              marginBottom: 6,
            }}
          />
          <View
            style={{
              height: 17,
              width: 120,
              backgroundColor: "#e5e7eb",
              borderRadius: 4,
            }}
          />
        </View>
      </View>
      <View
        style={[
          styles.cartButton,
          { backgroundColor: "#e5e7eb", width: 40, height: 40 },
        ]}
      />
    </View>
  );

  const [products, setProducts] = useState<any[]>([]);
  const [shuffledProducts, setShuffledProducts] = useState<any[]>([]);
  const [lastShuffle, setLastShuffle] = useState<number>(Date.now());
  const [productsLoading, setProductsLoading] = useState(true);

  const filterOptions = [
    "All",
    "Men",
    "Women",
    "Kids",
    "Accessories",
    "Shoes",
    "Sale",
  ];

  const onSearch = (text: string) => setSearchQuery(text);

  // Shuffle helper
  const shuffleArray = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setAuthUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const uid = await SecureStore.getItemAsync("uid");
        if (uid) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setToastMessage("Error connecting to server. Logging out...");
        setToastVisible(true);
        setTimeout(async () => {
          try {
            await signOut(auth);
            await persistor.purge();
            dispatch(setAuthenticated(false));
            dispatch(setToken(null));
          } catch (logoutErr) {
            console.error("Logout error:", logoutErr);
          } finally {
            setLoading(false);
          }
        }, 3000);
      }
    };

    fetchUserProfile();
  }, [dispatch]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        // Shuffle on fetch
        const shuffled = shuffleArray(productsData);
        setShuffledProducts(shuffled);
        setLastShuffle(Date.now());
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setToastMessage("Failed to load products. Try again later.");
        setToastVisible(true);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        [hours, minutes, seconds]
          .map((v) => v.toString().padStart(2, "0"))
          .join(":")
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reshuffle after countdown (every 24 hours)
  useEffect(() => {
    if (!products.length) return;
    // Calculate ms until midnight
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      const shuffled = shuffleArray(products);
      setShuffledProducts(shuffled);
      setLastShuffle(Date.now());
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [products, lastShuffle]);

  const lastSeen = userProfile?.lastSeen
    ? new Date(userProfile.lastSeen).toLocaleString()
    : "Just now";

  // Flash sale: first 6 products, rest: others
  const flashSaleProducts = shuffledProducts.slice(0, 6);
  const otherProducts = shuffledProducts.slice(6);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <GreetingSkeleton />
          {/* Search bar skeleton */}
          <View style={styles.searchFilterRow}>
            <View style={[styles.searchBar, { backgroundColor: "#e5e7eb" }]} />
            <View
              style={[
                styles.filterButtonStandalone,
                { backgroundColor: "#e5e7eb", width: 44, height: 44 },
              ]}
            />
          </View>
          {/* Promo banner skeleton */}
          <View
            style={[
              styles.promoBannerContainer,
              { backgroundColor: "#e5e7eb", minHeight: 140 },
            ]}
          />
          {/* Product skeletons */}
          <View style={styles.productsSection}>
            {[0, 1, 2].map((rowIdx) => (
              <View style={styles.productsRow} key={rowIdx}>
                <ProductSkeleton />
                <ProductSkeleton />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#000" : "#fff"}
      />
      <SafeAreaView style={styles.screen}>
        <CustomToast
          message={toastMessage}
          type="error"
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.topContainer}>
            {/* Top Section */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={styles.row}>
                <View style={styles.avatarContainer}>
                  {userProfile?.image ? (
                    <Image
                      source={{ uri: userProfile.image }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <PersonAvatar width={88} height={88} />
                  )}
                </View>
                <View style={styles.greetingColumn}>
                  <Text style={styles.greetingText}>Welcome back,</Text>
                  <Text style={styles.userNameText}>
                    {userProfile?.name || authUser?.displayName || "User"}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.navigate("/(tabs)/cart")}
              style={styles.cartButton}
            >
              <CartIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchBar}>
              <AntDesign
                name="search1"
                size={20}
                color={isDarkMode ? "#aaa" : "#6b7280"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={onSearch}
                placeholder="Search products..."
                placeholderTextColor={isDarkMode ? "#666" : "#9CA3AF"}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity
              style={styles.filterButtonStandalone}
              onPress={() => setFilterVisible((v) => !v)}
            >
              <FilterIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* Filter Drawer */}
          {filterVisible && (
            <View style={styles.filterDrawer}>
              <Text style={styles.filterTitle}>Filter by Category</Text>
              <View style={styles.filterOptionsRow}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterOption,
                      selectedFilter === option && styles.filterOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedFilter(option);
                      setFilterVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedFilter === option &&
                          styles.filterOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Promotional Banner */}
          <View style={styles.promoBannerContainer}>
            {/* Decorative Circles */}
            <View style={styles.promoCircleTopLeft} />
            <View style={styles.promoCircleBottomRight} />

            <View style={styles.promoContentRow}>
              {/* Content Section */}
              <View style={styles.promoContent}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>LIMITED TIME OFFER</Text>
                </View>
                <Text style={styles.promoHeadline}>50% OFF</Text>
                <Text style={styles.promoDescription}>
                  Shop now and save big on premium products. Hurry before the
                  offer ends!
                </Text>
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Shop Now</Text>
                </TouchableOpacity>
              </View>
              {/* Image Section */}
              <View style={styles.promoImageSection}>
                <Image
                  source={require("@/assets/images/photo-3.png")}
                  style={styles.promoImage}
                  resizeMode="contain"
                />
                <View style={styles.promoDiscountBadge}>
                  <Text style={styles.promoDiscountText}>50%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* All Products Section */}
          {!productsLoading && otherProducts.length > 0 && (
            <View style={styles.productsSection}>
              <View style={styles.productsHeaderRow}>
                <Text style={styles.productsTitle}>All Products</Text>
              </View>
              <View style={{ paddingBottom: 20 }}>
                {chunkArray(otherProducts, 2).map((row, rowIndex) => (
                  <View style={styles.productsRow} key={rowIndex}>
                    {row.map((product) => (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.productCardGrid}
                        activeOpacity={0.85}
                        onPress={() => router.push(`/product/${product.id}`)}
                      >
                        <Image
                          source={{ uri: product.images?.[0] }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                        <View style={{ paddingHorizontal: 5 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              flex: 1,
                              marginBottom: 5,
                            }}
                          >
                            <Text style={styles.productName} numberOfLines={1}>
                              {product.name}
                            </Text>
                            <View style={{ display: "none" }}>
                              <AntDesign
                                name="star"
                                size={14}
                                color={isDarkMode ? "#FFD700" : "#FFB300"}
                                style={{ marginRight: 2 }}
                              />
                              <Text
                                style={{
                                  color: isDarkMode ? "#FFD700" : "#FFB300",
                                  fontSize: 14,
                                  fontFamily: "BeVietnamPro-Regular",
                                }}
                              >
                                {product.rating}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.productPriceRow}>
                            <Text style={styles.productPrice}>
                              ₦
                              {Number(product.price).toLocaleString("en-NG", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </Text>
                            <Text style={styles.productOldPrice}>
                              ₦
                              {(
                                product.price -
                                product.price * 0.08297
                              ).toFixed(2)}
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
            </View>
          )}

          {/* Flash sales Section */}
          <View style={styles.productsSection}>
            <View style={styles.productsHeaderRow}>
              <Text style={styles.productsTitle}>Flash Sale</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.productsSeeAll}>Ends at: </Text>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
            </View>
            <View style={{ paddingBottom: 80 }}>
              {productsLoading ? (
                // Skeleton loader grid (2 per row, 2 rows)
                <>
                  {[0, 1, 2].map((rowIdx) => (
                    <View style={styles.productsRow} key={rowIdx}>
                      <ProductSkeleton />
                      <ProductSkeleton />
                    </View>
                  ))}
                </>
              ) : (
                chunkArray(flashSaleProducts, 2).map((row, rowIndex) => (
                  <View style={styles.productsRow} key={rowIndex}>
                    {row.map((product) => (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.productCardGrid}
                        activeOpacity={0.85}
                        onPress={() => router.push(`/product/${product.id}`)}
                      >
                        <Image
                          source={{ uri: product.images?.[0] }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                        <View style={{ paddingHorizontal: 5 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              flex: 1,
                              marginBottom: 5,
                            }}
                          >
                            <Text style={styles.productName} numberOfLines={1}>
                              {product.name}
                            </Text>
                            <View style={{ display: "none" }}>
                              <AntDesign
                                name="star"
                                size={14}
                                color={isDarkMode ? "#FFD700" : "#FFB300"}
                                style={{ marginRight: 2 }}
                              />
                              <Text
                                style={{
                                  color: isDarkMode ? "#FFD700" : "#FFB300",
                                  fontSize: 14,
                                  fontFamily: "BeVietnamPro-Regular",
                                }}
                              >
                                {product.rating}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.productPriceRow}>
                            <Text style={styles.productPrice}>
                              ₦
                              {Number(product.price).toLocaleString("en-NG", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </Text>
                            <Text style={styles.productOldPrice}>
                              ₦
                              {(
                                product.price -
                                product.price * 0.08297
                              ).toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                    {/* Fill empty space if row has only one item */}
                    {row.length < 2 && <View style={styles.productCardGrid} />}
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 0.98,
      backgroundColor: isDarkMode ? "#000" : "#f9fafb",
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
      justifyContent: "center",
      alignItems: "center",
    },
    scrollViewContent: {
      flexGrow: 0.5,
      paddingHorizontal: 16,
      borderWidth: 0,
    },
    topContainer: {
      paddingVertical: 10,
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 44,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDarkMode ? "#444" : "#ccc",
      backgroundColor: isDarkMode ? "#222" : "#f0f0f0",
    },
    avatarImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 1,
      borderColor: isDarkMode ? "#444" : "#ccc",
    },
    greetingColumn: {
      flexDirection: "column",
      gap: 3,
    },
    greetingText: {
      fontSize: 15,
      fontFamily: "BeVietnamPro-Medium",
      color: isDarkMode ? "#fff" : "#111",
    },
    userNameText: {
      fontSize: 17,
      fontFamily: "BeVietnamPro-Regular",
      color: isDarkMode ? "#fff" : "#111",
    },
    cartButton: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
      backgroundColor: isDarkMode ? "#222" : "#edeef0",
      padding: 8,
      borderRadius: 100,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 1, height: 2 },
      shadowRadius: 6,
      elevation: 2,
    },
    searchFilterRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 18,
      marginBottom: 10,
      gap: 10,
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#222" : "#edeef0",
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 12,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 1,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: "BeVietnamPro-Regular",
      color: isDarkMode ? "#fff" : "#374151",
      backgroundColor: "transparent",
      paddingVertical: 0,
    },
    filterButtonStandalone: {
      marginLeft: 0,
      padding: 10,
      borderRadius: 44,
      backgroundColor: isDarkMode ? "#222" : "#edeef0",
      alignItems: "center",
      justifyContent: "center",
    },
    filterDrawer: {
      marginTop: 4,
      backgroundColor: isDarkMode ? "#232323" : "#fff",
      borderRadius: 14,
      padding: 14,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 2,
    },
    filterTitle: {
      fontSize: 15,
      fontFamily: "BeVietnamPro-Medium",
      color: isDarkMode ? "#fff" : "#222",
      marginBottom: 18,
    },
    filterOptionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    filterOption: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: isDarkMode ? "#18181b" : "#edeef0",
      marginBottom: 6,
      marginRight: 6,
    },
    filterOptionSelected: {
      backgroundColor: "#FF6347",
    },
    filterOptionText: {
      fontSize: 14,
      color: isDarkMode ? "#fff" : "#374151",
      fontFamily: "BeVietnamPro-Regular",
    },
    filterOptionTextSelected: {
      color: "#fff",
      fontFamily: "BeVietnamPro-Medium",
    },
    promoBannerContainer: {
      marginTop: 10,
      marginBottom: 18,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "#23272f" : "#FF6347",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 16,
      elevation: 4,
      position: "relative",
      minHeight: 140,
    },
    promoCircleTopLeft: {
      position: "absolute",
      top: -40,
      left: -40,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.06)"
        : "rgba(255,255,255,0.10)",
      zIndex: 1,
    },
    promoCircleBottomRight: {
      position: "absolute",
      bottom: -32,
      right: -32,
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.06)"
        : "rgba(255,255,255,0.10)",
      zIndex: 1,
    },
    promoContentRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      zIndex: 2,
    },
    promoContent: {
      flex: 1,
      paddingRight: 10,
    },
    promoBadge: {
      alignSelf: "flex-start",
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginBottom: 10,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.12)"
        : "rgba(255,255,255,0.20)",
    },
    promoBadgeText: {
      color: isDarkMode ? "#fff" : "#fff",
      fontSize: 11,
      fontFamily: "interBold",
      letterSpacing: 1,
    },
    promoHeadline: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#fff",
      fontFamily: "interBold",
      marginBottom: 6,
    },
    promoDescription: {
      fontSize: 14,
      color: isDarkMode ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.92)",
      fontFamily: "interMedium",
      marginBottom: 10,
      lineHeight: 20,
    },
    promoButton: {
      backgroundColor: isDarkMode ? "#fff" : "#fff",
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 8,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    promoButtonText: {
      color: isDarkMode ? "#23272f" : "#FF6347",
      fontFamily: "interSemiBold",
      fontSize: 15,
    },
    promoImageSection: {
      width: 100,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    promoImage: {
      width: 150,
      height: 150,
    },
    promoDiscountBadge: {
      position: "absolute",
      top: -10,
      right: -10,
      backgroundColor: isDarkMode ? "#11131a" : "#1e1e26",
      borderRadius: 24,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "12deg" }],
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    promoDiscountText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      fontFamily: "BeVietnamPro-Medium",
    },
    productsSection: {
      marginTop: 10,
    },
    productsHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      paddingHorizontal: 2,
    },
    productsTitle: {
      fontSize: 18,
      fontFamily: "BeVietnamPro-Medium",
      fontWeight: "500",
      color: isDarkMode ? "#fff" : "#222",
      letterSpacing: 0.2,
    },
    productsSeeAll: {
      fontSize: 16,
      color: isDarkMode ? "#fff" : "#222",
      fontFamily: "BeVietnamPro-Regular",
    },
    countdownText: {
      fontSize: 16,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "#FF6347" : "#FF6347",
      color: isDarkMode ? "#fff" : "#fff",
      fontFamily: "BeVietnamPro-Regular",
      marginLeft: 4,
      letterSpacing: 1,
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
    },
    productImage: {
      width: "100%",
      height: 160,
      borderRadius: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#DCDCDC40",
    },
    productName: {
      fontSize: 15,
      fontFamily: "BeVietnamPro-Regular",
      color: isDarkMode ? "#fff" : "#222",
      marginBottom: 4,
    },
    productStarsRow: {
      flexDirection: "row",
      marginBottom: 6,
      alignItems: "center",
      justifyContent: "center",
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
