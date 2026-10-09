import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// User's Live Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbOUuhp2Ye_e9O9LIBN86KoDz98Fx2Gkg",
  authDomain: "citysphere-ca6e4.firebaseapp.com",
  databaseURL: "https://citysphere-ca6e4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "citysphere-ca6e4",
  storageBucket: "citysphere-ca6e4.firebasestorage.app",
  messagingSenderId: "842410144120",
  appId: "1:842410144120:web:e44503438ef248b615588d",
  measurementId: "G-76N6MFWEHP"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  app,
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
};
