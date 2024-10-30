import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseInstance } from "../services/Firebase/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = getAuth(firebaseInstance); // Initialize auth
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, auth, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);
