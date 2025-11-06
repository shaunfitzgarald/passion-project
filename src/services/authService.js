import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Sign up with email and password
 */
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Send email link for passwordless sign-in
 */
export const sendEmailLink = async (email, actionCodeSettings = null) => {
  try {
    // Default action code settings if not provided
    const defaultSettings = {
      url: window.location.origin + '/auth/verify-email',
      handleCodeInApp: true,
    };
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings || defaultSettings);
    
    // Save email to localStorage for later use
    window.localStorage.setItem('emailForSignIn', email);
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Check if the current link is a sign-in link
 */
export const checkEmailLink = () => {
  return isSignInWithEmailLink(auth, window.location.href);
};

/**
 * Sign in with email link
 */
export const signInWithEmailLink = async (email) => {
  try {
    const userCredential = await firebaseSignInWithEmailLink(auth, email, window.location.href);
    
    // Clear the email from localStorage
    window.localStorage.removeItem('emailForSignIn');
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin + '/auth/login',
      handleCodeInApp: false,
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Sign out current user
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

