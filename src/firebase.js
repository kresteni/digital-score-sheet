import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIV37Fpo49yIaexNTG4rnfOdPR_H_r0DA",
  authDomain: "digital-score-sheet.firebaseapp.com",
  databaseURL: "https://digital-score-sheet-default-rtdb.firebaseio.com",
  projectId: "digital-score-sheet",
  storageBucket: "digital-score-sheet.firebasestorage.app",
  messagingSenderId: "828532972489",
  appId: "1:828532972489:web:7ff363beeccbee8969a618",
  measurementId: "G-RN7W3T4PFF"
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

export { auth, db };