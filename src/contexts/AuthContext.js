import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../services/authService';
import { getUserProfile, createUserProfile } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        try {
          // Fetch user profile with role
          const profileResult = await getUserProfile(authUser.uid);
          if (profileResult.user) {
            setUserProfile(profileResult.user);
          } else {
            // Create profile if it doesn't exist
            try {
              await createUserProfile(authUser.uid, {
                email: authUser.email,
                displayName: authUser.displayName,
                role: 'user',
              });
              setUserProfile({ role: 'user' });
            } catch (profileError) {
              console.warn('Could not create user profile:', profileError);
              setUserProfile({ role: 'user' });
            }
          }
        } catch (error) {
          console.warn('Error fetching user profile:', error);
          setUserProfile({ role: 'user' });
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    isAdmin: userProfile?.role === 'admin',
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

