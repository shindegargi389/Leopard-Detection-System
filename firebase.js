import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDPtE5Kgiu4af4KZdiMWz9MtL1hZalJq9Y",
  authDomain: "leopard-detection-and-alert-sy.firebaseapp.com",
  databaseURL: "https://leopard-detection-and-alert-sy-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "leopard-detection-and-alert-sy",
  storageBucket: "leopard-detection-and-alert-sy.firebasestorage.app",
  messagingSenderId: "388366641533",
  appId: "1:388366641533:web:8ad3dce2a360f01e6dc414"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);