import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const login = async ({ loginData }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginData.email,
      loginData.password
    );

    // Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    let userData = { uid: userCredential.user.uid, email: userCredential.user.email };

    if (userDoc.exists()) {
      userData = { ...userData, ...userDoc.data() };
    }

    return {
      success: true,
      result: userData
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

export const register = async ({ registerData }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      registerData.email,
      registerData.password
    );

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: registerData.email,
      firstName: registerData.firstName || '',
      lastName: registerData.lastName || '',
      role: registerData.role || 'Staff',
      department: registerData.department || '',
      isActive: true,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      result: { uid: userCredential.user.uid, email: registerData.email }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

export const resetPassword = async ({ resetPasswordData }) => {
  try {
    await sendPasswordResetEmail(auth, resetPasswordData.email);
    return {
      success: true,
      message: 'Password reset email sent'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

export const logout = async () => {
  try {
    await firebaseSignOut(auth);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

