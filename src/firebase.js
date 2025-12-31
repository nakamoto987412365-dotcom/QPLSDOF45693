// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TUS LLAVES REALES (Copiadas de tu imagen)
const firebaseConfig = {
  apiKey: "AIzaSyCuon5FXcrO1zA59JRCCNYuIkhewKISLyc",
  authDomain: "qplsdof45693.firebaseapp.com",
  projectId: "qplsdof45693",
  storageBucket: "qplsdof45693.firebasestorage.app",
  messagingSenderId: "1005339385306",
  appId: "1:1005339385306:web:2435c43ede046250ac34e3",
  measurementId: "G-JWHK16W1NP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la base de datos para usarla en la app
export const db = getFirestore(app);