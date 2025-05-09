import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setUserRole(data.role || 'user');
            
            // Update last login timestamp
            await updateDoc(doc(db, 'users', user.uid), {
              lastLogin: new Date()
            });

            // Merge user data with auth user
            setCurrentUser({
              ...user,
              role: data.role || 'user',
              displayName: data.displayName || user.email,
              ...data
            });

            // Store in localStorage for persistence
            localStorage.setItem('userData', JSON.stringify({
              uid: user.uid,
              email: user.email,
              role: data.role,
              displayName: data.displayName || user.email
            }));
          } else {
            setCurrentUser(user);
            setUserRole(null);
            setError('User data not found');
          }
        } else {
          setCurrentUser(null);
          setUserData(null);
          setUserRole(null);
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError(error.message);
        setCurrentUser(null);
        setUserData(null);
        setUserRole(null);
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      setUserRole(null);
      localStorage.removeItem('userData');
      localStorage.removeItem('selectedRole');
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    error,
    logout,
    userRole,
    isAuthenticated: !!currentUser,
    isAdmin: userRole === 'admin',
    isHeadMarshall: userRole === 'head-marshall',
    isMarshall: userRole === 'marshall'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 