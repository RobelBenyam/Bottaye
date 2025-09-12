import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { User } from "../types";
import toast from "react-hot-toast";
import { createDocument } from "@/lib/db";

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;

  signOut: () => Promise<void>;
  initializeAuth: () => void;
}

// Helper functions for localStorage persistence
const saveUserToStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem("bottaye_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("bottaye_user");
  }
};

const getUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem("bottaye_user");
    if (stored) {
      const user = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (user.createdAt) user.createdAt = new Date(user.createdAt);
      if (user.updatedAt) user.updatedAt = new Date(user.updatedAt);
      return user;
    }
  } catch (error) {
    console.error("Error loading user from storage:", error);
    localStorage.removeItem("bottaye_user");
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getUserFromStorage(), // Initialize from localStorage
  loading: !getUserFromStorage(), // Don't show loading if we have a user from storage

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Signed in user:", userCredential);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const userData = userDoc.data();
      const user: User = {
        id: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        propertyIds: userData.propertyIds || [],
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };

      saveUserToStorage(user); // Save to localStorage
      set({ user, loading: false });
      toast.success(`Welcome back, ${user.name}!`);
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true });
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // After sign up, user needs to log in to fetch profile
      const userObj: User = {
        id: userCredential.user.uid,
        email,
        name,
        role: "admin",
        propertyIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(doc(db, "users", userCredential.user.uid), {
        id: userCredential.user.uid,
        email,
        name,
        role: "admin",
        propertyIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      saveUserToStorage(userObj); // Save to localStorage
      set({ user: userObj, loading: false });
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.message || "Failed to sign up");
      throw error;
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      saveUserToStorage(null); // Clear from localStorage
      set({ user: null });
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error("Failed to sign out");
      throw error;
    }
  },

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        // Check if we already have a demo user - don't override it
        const currentState = useAuthStore.getState();
        if (currentState.user && currentState.user.id === "demo-user") {
          console.log("🎯 Demo user detected, skipping Firebase auth");
          set({ loading: false });
          return;
        }

        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const user: User = {
                id: firebaseUser.uid,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                propertyIds: userData.propertyIds || [],
                createdAt: userData.createdAt?.toDate() || new Date(),
                updatedAt: userData.updatedAt?.toDate() || new Date(),
              };
              saveUserToStorage(user); // Save to localStorage
              set({ user, loading: false });
            } else {
              set({ user: null, loading: false });
            }
          } catch (error) {
            console.log("🔄 Firebase auth error, keeping current state");
            set({ loading: false });
          }
        } else {
          // Only clear user if we don't have a demo user
          if (!currentState.user || currentState.user.id !== "demo-user") {
            saveUserToStorage(null); // Clear from localStorage
            set({ user: null, loading: false });
          } else {
            set({ loading: false });
          }
        }
      }
    );

    return unsubscribe;
  },
}));
