// src/firebase.js
import firebase from "firebase/app";
import "firebase/database";  // Add other Firebase services as needed

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
export default database;
