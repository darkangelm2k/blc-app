// Importamos las herramientas principales de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Esta es la base de datos

// Tus llaves secretas de conexión (Copiadas de tu consola)
const firebaseConfig = {
  apiKey: "AIzaSyC_m0jmIi5NEcC9Fgni6l3fvWHAqoyF45s",
  authDomain: "sistema-asistencia-blc.firebaseapp.com",
  projectId: "sistema-asistencia-blc",
  storageBucket: "sistema-asistencia-blc.firebasestorage.app",
  messagingSenderId: "221856138738",
  appId: "1:221856138738:web:c173f8d26b32b0ddb4d76b",
  measurementId: "G-49K0EEHLCL"
};

// Inicializamos la aplicación y la base de datos
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);