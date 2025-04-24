import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };