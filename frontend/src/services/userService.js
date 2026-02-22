import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Create a user profile document in Firestore users/{uid}
 */
export const createUserProfile = async (uid, data) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            ...data,
            createdAt: new Date().toISOString(),
            isActive: true,
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

/**
 * Get a user profile from Firestore users/{uid}
 */
export const getUserProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { success: true, data: { uid, ...userDoc.data() } };
        }
        return { success: false, message: 'User profile not found' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

/**
 * Update a user profile in Firestore users/{uid}
 */
export const updateUserProfile = async (uid, data) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            ...data,
            updatedAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
