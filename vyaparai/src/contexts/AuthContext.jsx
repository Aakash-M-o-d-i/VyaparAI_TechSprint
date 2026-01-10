/**
 * Authentication Context
 * Handles Firebase authentication and user session management
 */
import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign in with Google
    async function signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await createOrUpdateUserProfile(result.user);
            return result.user;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    }

    // Phone authentication with OTP
    async function sendOTP(phoneNumber, recaptchaContainer) {
        try {
            const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
                size: 'invisible'
            });
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            return confirmationResult;
        } catch (error) {
            console.error('Send OTP error:', error);
            throw error;
        }
    }

    async function verifyOTP(confirmationResult, otp) {
        try {
            const result = await confirmationResult.confirm(otp);
            await createOrUpdateUserProfile(result.user);
            return result.user;
        } catch (error) {
            console.error('Verify OTP error:', error);
            throw error;
        }
    }

    // Create or update user profile in Firestore
    async function createOrUpdateUserProfile(user, additionalData = {}) {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create new user profile
            const newProfile = {
                uid: user.uid,
                email: user.email || null,
                phone: user.phoneNumber || null,
                displayName: user.displayName || 'User',
                photoURL: user.photoURL || null,
                language: 'en',
                businessName: '',
                businessType: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...additionalData
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
        } else {
            // Update existing profile
            const existingProfile = userSnap.data();
            const updatedProfile = {
                ...existingProfile,
                ...additionalData,
                updatedAt: new Date().toISOString()
            };
            await updateDoc(userRef, updatedProfile);
            setUserProfile(updatedProfile);
        }
    }

    // Fetch user profile from Firestore
    async function fetchUserProfile(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserProfile(userSnap.data());
                return userSnap.data();
            }
            return null;
        } catch (error) {
            console.error('Fetch profile error:', error);
            return null;
        }
    }

    // Update user language preference
    async function updateLanguage(language) {
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                language,
                updatedAt: new Date().toISOString()
            });
            setUserProfile(prev => ({ ...prev, language }));
        } catch (error) {
            console.error('Update language error:', error);
            throw error;
        }
    }

    // Update business profile
    async function updateBusinessProfile(businessData) {
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                ...businessData,
                updatedAt: new Date().toISOString()
            });
            setUserProfile(prev => ({ ...prev, ...businessData }));
        } catch (error) {
            console.error('Update business profile error:', error);
            throw error;
        }
    }

    // Sign out
    async function logout() {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        sendOTP,
        verifyOTP,
        updateLanguage,
        updateBusinessProfile,
        logout,
        fetchUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
