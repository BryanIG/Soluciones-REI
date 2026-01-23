// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfp-HK5ezBDG_eAyEP6Fm77cRQcHdzxLY",
  authDomain: "soluciones-rei.firebaseapp.com",
  projectId: "soluciones-rei",
  storageBucket: "soluciones-rei.firebasestorage.app",
  messagingSenderId: "480165604588",
  appId: "1:480165604588:web:011f2637116dab8ef689c9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);