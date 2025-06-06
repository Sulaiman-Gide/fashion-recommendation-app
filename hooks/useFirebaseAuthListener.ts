import { auth } from "@/lib/firebase";
import { setAuthenticated, setToken } from "@/store/authSlice";
import type { User } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function useFirebaseAuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
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
}
