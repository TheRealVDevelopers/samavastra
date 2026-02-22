import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBO1ogByuIAGnWMn3G9LdfSsNByHQBSVzE",
    authDomain: "samavastra-3d457.firebaseapp.com",
    projectId: "samavastra-3d457",
    storageBucket: "samavastra-3d457.firebasestorage.app",
    messagingSenderId: "1067043182138",
    appId: "1:1067043182138:web:70cbea7f304f57776fc703",
    measurementId: "G-2C0TSXNJW6"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
