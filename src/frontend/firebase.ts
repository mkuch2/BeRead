import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXQ4uowq-vP4iwe7pJ28dMTRNXVrXj9Cg",

  authDomain: "cs-35l-9a5f0.firebaseapp.com",

  projectId: "cs-35l-9a5f0",

  storageBucket: "cs-35l-9a5f0.firebasestorage.app",

  messagingSenderId: "137263665279",

  appId: "1:137263665279:web:d46fa980ac81a54c31af4a",

  measurementId: "G-TZGEVRVVVJ",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export default auth;
