// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // getAuth를 import 합니다.

// 여기에 아까 복사한 firebaseConfig 코드를 붙여넣으세요.
const firebaseConfig = {
  apiKey: "AIzaSyDyhwXQ6EvA5rkrZOVFaDMxp1dvw_0SE9M",
  authDomain: "sage-fineart-todo.firebaseapp.com",
  projectId: "sage-fineart-todo",
  storageBucket: "sage-fineart-todo.firebasestorage.app",
  messagingSenderId: "86733459877",
  appId: "1:86733459877:web:8f1278e646785b1bce584c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // auth 객체를 생성합니다.

export { db, auth }; // db와 auth를 함께 export 합니다.