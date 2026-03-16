import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, onSnapshot, orderBy, limit, Timestamp, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Helper for Google Sign-In (Mobile-Friendly)
export const signInWithGoogle = async () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    return signInWithRedirect(auth, googleProvider);
  } else {
    return signInWithPopup(auth, googleProvider);
  }
};

export { 
  doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, onSnapshot, orderBy, limit, Timestamp, updateDoc, 
  signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  getRedirectResult
};
