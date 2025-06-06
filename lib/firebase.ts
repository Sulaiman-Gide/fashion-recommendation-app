import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // ... your config details ...
  apiKey: "AIzaSyDakmB8Ss8L9oLJCktjJ622XjbZb_qPQlk",
  authDomain: "fashionapp-47b05.firebaseapp.com",
  projectId: "fashionapp-47b05",
  storageBucket: "fashionapp-47b05.firebasestorage.app",
  messagingSenderId: "597774996968",
  appId: "1:597774996968:web:47bea9d26007f2994b805d",
  measurementId: "G-8FKWDWB2MD",
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(firebaseApp);
export { auth, db, firebaseApp };
