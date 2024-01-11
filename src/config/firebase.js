import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAA1TEIaHMFJ3mtGTmElbnJXkDdcyXFM4o",
  authDomain: "badat-health-tracking.firebaseapp.com",
  projectId: "badat-health-tracking",
  storageBucket: "badat-health-tracking.appspot.com",
  messagingSenderId: "889585687218",
  appId: "1:889585687218:web:a1419205cc5eee009f07ab"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);