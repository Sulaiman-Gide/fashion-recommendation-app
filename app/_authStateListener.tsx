import { auth } from "@/lib/firebase";
import { setAuthenticated, setToken } from "@/store/authSlice";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AuthStateListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch(setAuthenticated(true));
        const token = await user.getIdToken();
        dispatch(setToken(token));
      } else {
        dispatch(setAuthenticated(false));
        dispatch(setToken(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}
