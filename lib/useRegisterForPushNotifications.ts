import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

export function useRegisterForPushNotifications() {
  useEffect(() => {
    async function register() {
      try {
        // console.log("Registering for notifications...");
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          //console.log("Notification permission not granted");
          return;
        }

        const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
        //console.log("Expo Push Token:", expoToken);

        const deviceTokenResult = await Notifications.getDevicePushTokenAsync();
        //console.log("Device FCM Token:", deviceTokenResult);

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }
      } catch (err) {
        //console.log("Error registering for notifications:", err);
      }
    }
    register();
  }, []);
}
