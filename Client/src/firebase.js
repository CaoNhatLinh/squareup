import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDRrvINS8pwg1pDfSqfdTGoJtx10nm7DJw",
  authDomain: "nhahang-e92c2.firebaseapp.com",
  databaseURL: "https://nhahang-e92c2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nhahang-e92c2",
  storageBucket: "nhahang-e92c2.firebasestorage.app",
  messagingSenderId: "118989981906",
  appId: "1:118989981906:web:a39873d675d4209d76450b",
  measurementId: "G-51NFJTNT55"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
