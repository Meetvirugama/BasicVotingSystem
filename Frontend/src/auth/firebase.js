import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVX5s7w2nISVaUbnrV5w89alYUszcuCi0",
  authDomain: "votingsystem-2fd4d.firebaseapp.com",
  projectId: "votingsystem-2fd4d",
  storageBucket: "votingsystem-2fd4d.appspot.com",
  messagingSenderId: "1080751100484",
  appId: "1:1080751100484:web:01e2ea2307ed6186b2a211"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
