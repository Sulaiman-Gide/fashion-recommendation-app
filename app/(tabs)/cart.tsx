import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import CustomToast, { ToastType } from "../../components/CustomToast";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  CartItem,
  clearCart,
  removeFromCart,
  selectCartItems,
  updateQuantity,
} from "../../store/cartSlice";

export default function CartScreen() {
  const { user } = useAuth();
  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);
  const { isDarkMode } = useTheme();
  const getStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: isDarkMode ? "#000" : "#f9fafb",
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isDarkMode ? "#000" : "#f9fafb",
      },
      loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: "500",
      },
      header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? "#333" : "#e5e7eb",
      },
      headerTitle: {
        fontSize: 22,
        fontWeight: "700",
      },
      clearButton: {
        color: "#FF6347",
        fontSize: 14,
        fontWeight: "500",
      },
      emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
      },
      emptyText: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 16,
        textAlign: "center",
      },
      emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
        maxWidth: 300,
      },
      itemsContainer: {
        flex: 1,
        padding: 16,
      },
      infoPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 6,
        marginBottom: 4,
        minWidth: 30,
      },
      itemCard: {
        flexDirection: "row",
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        alignItems: "center",
      },
      itemImage: {
        width: 80,
        height: 100,
        borderRadius: 6,
        marginRight: 12,
      },
      itemDetails: {
        flex: 1,
      },
      itemName: {
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 4,
      },
      itemMeta: {
        fontSize: 13,
        color: "#666",
        marginBottom: 2,
      },
      itemPrice: {
        fontSize: 15,
        fontWeight: "600",
        marginTop: 4,
      },
      quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 20,
        alignSelf: "flex-start",
        marginTop: 8,
      },
      quantityButton: {
        padding: 4,
        alignItems: "center",
        justifyContent: "center",
      },
      quantityText: {
        minWidth: 24,
        textAlign: "center",
        fontSize: 14,
        fontWeight: "500",
      },
      removeButton: {
        padding: 4,
        marginLeft: 8,
      },
      summaryContainer: {
        backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? "#333" : "#e5e7eb",
      },
      summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
      },
      summaryLabel: {
        fontSize: 14,
        color: isDarkMode ? "#fff" : "#000",
      },
      summaryValue: {
        fontSize: 14,
        fontWeight: "500",
        color: isDarkMode ? "#fff" : "#000",
      },
      divider: {
        height: 1,
        backgroundColor: isDarkMode ? "#333" : "#e5e7eb",
        marginVertical: 12,
      },
      totalRow: {
        marginTop: 4,
      },
      totalLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: isDarkMode ? "#fff" : "#000",
      },
      totalValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FF6347",
      },
      checkoutButton: {
        backgroundColor: "#FF6347",
        borderRadius: 8,
        padding: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
      },
      checkoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
      },
    });
  const styles = getStyles(isDarkMode);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const calculateTotal = (): number => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0
    );
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(itemId));
      showToast("Item removed from cart");
      return;
    }
    dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
    showToast("Item removed from cart");
  };

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          dispatch(clearCart());
          showToast("Cart cleared");
        },
      },
    ]);
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }
    setShowPaymentModal(true);
  };

  const formatCardNumber = (input: string): string => {
    const digits = input.replace(/\D/g, "");
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.trim();
  };

  const formatExpiryDate = (input: string): string => {
    const digits = input.replace(/\D/g, "");
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const validateExpiryDate = (date: string): boolean => {
    if (!date || date.length < 5) return false;

    const [monthStr, yearStr] = date.split("/");
    const month = parseInt(monthStr, 10);
    const year = 2000 + parseInt(yearStr, 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  };

  // Update your state handlers
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiry(formatted);
  };

  const handleCvvChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    setCvv(digits);
  };

  const validateForm = (): boolean => {
    // Validate card number (16-19 digits after removing spaces)
    const cardDigits = cardNumber.replace(/\s/g, "");
    if (cardDigits.length < 16 || cardDigits.length > 19) {
      showToast("Please enter a valid 16-19 digit card number", "error");
      return false;
    }

    // Validate expiry date
    if (!validateExpiryDate(expiry)) {
      showToast("Please enter a valid expiry date (MM/YY)", "error");
      return false;
    }

    // Validate CVV (3-4 digits)
    if (cvv.length < 3 || cvv.length > 4) {
      showToast("Please enter a valid CVV (3-4 digits)", "error");
      return false;
    }

    return true;
  };

  // Helper to get user name
  const getUserName = () => {
    // Try Firebase user displayName, fallback to email prefix
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  // Helper to get product names (for notification)
  const getProductNames = () => {
    if (!cartItems || cartItems.length === 0) return "your items";
    if (cartItems.length === 1) return cartItems[0].name;
    return cartItems.map((item) => item.name).join(", ");
  };

  // Payment handler with Supabase and notification
  const handleDummyPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Prepare activity data
      const activityData = {
        user_id: user?.uid || null,
        user_name: getUserName(),
        products: cartItems.map(
          ({ id, name, price, quantity, size, color }) => ({
            id,
            name,
            price,
            quantity,
            size,
            color,
          })
        ),
        total_amount: calculateTotal() + (cartItems.length > 0 ? 2500 : 0),
        status: "success",
        created_at: new Date().toISOString(),
      };

      // Insert into Supabase activity table
      const { error } = await supabase.from("activity").insert([activityData]);
      if (error) {
        showToast("Payment succeeded but failed to log activity.", "error");
        console.log("Supabase insert error:", error);
      } else {
        showToast("Payment successful! Your order has been placed.", "success");
      }

      // Local notification with sound and vibration
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Dear ${getUserName()}`,
          body: `Thank you for purchasing ${getProductNames()}. Your payment is successful.`,
          sound: true,
        },
        trigger: null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setShowPaymentModal(false);
      dispatch(clearCart());
      setCardNumber("");
      setExpiry("");
      setCvv("");
    } catch (err) {
      showToast("Payment failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? "#000" : "#f9fafb" },
        ]}
      >
        <ActivityIndicator size="large" color="#FF6347" />
        <Text
          style={[styles.loadingText, { color: isDarkMode ? "#fff" : "#000" }]}
        >
          Processing your order...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#000" : "#f9fafb" },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#000" }]}
        >
          Shopping Cart
        </Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cart-outline"
            size={80}
            color={isDarkMode ? "#666" : "#ccc"}
          />
          <Text
            style={[styles.emptyText, { color: isDarkMode ? "#fff" : "#000" }]}
          >
            Your cart is empty
          </Text>
          <Text
            style={[
              styles.emptySubtext,
              { color: isDarkMode ? "#aaa" : "#666" },
            ]}
          >
            Browse our collection and add items to your cart
          </Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.itemsContainer}>
            {cartItems.map((item) => (
              <View
                key={`${item.id}-${item.size}-${item.color}`}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  },
                ]}
              >
                <Image
                  source={{ uri: item.image }}
                  style={[
                    styles.itemImage,
                    {
                      width: 80,
                      height: 100,
                      borderRadius: 8,
                      marginRight: 12,
                    },
                  ]}
                  resizeMode="cover"
                />

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.itemName,
                          {
                            color: isDarkMode ? "#fff" : "#000",
                            fontSize: 16,
                            fontWeight: "500",
                            marginBottom: 4,
                          },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.name}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          marginBottom: 6,
                        }}
                      >
                        {item.size && (
                          <View
                            style={[
                              styles.infoPill,
                              {
                                backgroundColor: isDarkMode
                                  ? "#2a2a2a"
                                  : "#f5f5f5",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.itemMeta,
                                { color: isDarkMode ? "#ccc" : "#666" },
                              ]}
                            >
                              {item.size}
                            </Text>
                          </View>
                        )}
                        {item.color && (
                          <View
                            style={[
                              styles.infoPill,
                              {
                                backgroundColor: item.color.toLowerCase(),
                                borderWidth: 1,
                                borderColor: isDarkMode ? "#444" : "#ddd",
                                marginLeft: 6,
                              },
                            ]}
                          >
                            {item.color.toLowerCase() === "#ffffff" ||
                            item.color.toLowerCase() === "white" ? (
                              <View
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 6,
                                  backgroundColor: "#ccc",
                                  borderWidth: 1,
                                  borderColor: "#999",
                                }}
                              />
                            ) : null}
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.itemPrice,
                          {
                            color: "#FF6347",
                            fontSize: 16,
                            fontWeight: "600",
                            marginTop: 4,
                          },
                        ]}
                      >
                        ₦{item.price.toLocaleString()}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={isDarkMode ? "#888" : "#999"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.quantityContainer,
                      {
                        marginTop: 12,
                        alignSelf: "flex-start",
                        borderWidth: 1,
                        borderColor: isDarkMode ? "#333" : "#e0e0e0",
                        borderRadius: 20,
                        overflow: "hidden",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        {
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
                        },
                      ]}
                      onPress={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Ionicons
                        name="remove"
                        size={16}
                        color={isDarkMode ? "#fff" : "#333"}
                      />
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.quantityText,
                        {
                          color: isDarkMode ? "#fff" : "#000",
                          paddingHorizontal: 12,
                          fontSize: 15,
                          fontWeight: "500",
                        },
                      ]}
                    >
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        {
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
                        },
                      ]}
                      onPress={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={isDarkMode ? "#fff" : "#333"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View
            style={[
              styles.summaryContainer,
              {
                backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
                paddingBottom: 110,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                Subtotal
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                ₦{calculateTotal().toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                Shipping
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                ₦{cartItems.length > 0 ? "2,500" : "0"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text
                style={[
                  styles.totalLabel,
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                Total
              </Text>
              <Text style={[styles.totalValue, { color: "#FF6347" }]}>
                ₦
                {(
                  calculateTotal() + (cartItems.length > 0 ? 2500 : 0)
                ).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={cartItems.length === 0}
            >
              <Text style={styles.checkoutButtonText}>
                {loading ? "Processing..." : "Proceed to Payment"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
      <CustomToast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
      {showPaymentModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <View
            style={{
              width: "92%",
              backgroundColor: isDarkMode ? "#181818" : "#fff",
              borderRadius: 24,
              padding: 28,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: isDarkMode ? "#fff" : "#222",
                marginBottom: 24,
                textAlign: "center",
                letterSpacing: 1.2,
              }}
            >
              Card Payment
            </Text>
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: isDarkMode ? "#aaa" : "#444",
                  marginBottom: 6,
                }}
              >
                Card Number
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDarkMode ? "#222" : "#f5f5f5",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Ionicons
                  name="card-outline"
                  size={22}
                  color="#FF6347"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: isDarkMode ? "#fff" : "#222",
                  }}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
                  keyboardType="number-pad"
                  maxLength={19}
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkMode ? "#aaa" : "#444",
                    marginBottom: 8,
                  }}
                >
                  Expiry
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDarkMode ? "#222" : "#f5f5f5",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#FF6347"
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: isDarkMode ? "#fff" : "#222",
                    }}
                    placeholder="MM/YY"
                    placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
                    keyboardType="number-pad"
                    maxLength={5}
                    value={expiry}
                    onChangeText={handleExpiryChange}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkMode ? "#aaa" : "#444",
                    marginBottom: 8,
                  }}
                >
                  CVV
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDarkMode ? "#222" : "#f5f5f5",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#FF6347"
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: isDarkMode ? "#fff" : "#222",
                    }}
                    placeholder="CVV"
                    placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
                    keyboardType="number-pad"
                    maxLength={4}
                    value={cvv}
                    onChangeText={handleCvvChange}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: "#FF6347",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginTop: 8,
                shadowColor: "#FF6347",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleDummyPayment}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                {loading
                  ? "Processing..."
                  : `Pay ₦${(
                      calculateTotal() + (cartItems.length > 0 ? 2500 : 0)
                    ).toLocaleString()}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 18, alignItems: "center" }}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text
                style={{ color: isDarkMode ? "#aaa" : "#444", fontSize: 15 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
  // Removed extra closing brace

  // getStyles moved above for correct usage
}
