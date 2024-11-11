import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDoZmvts6RRi0CHC0rwedAExxOfmKaYapE",
    authDomain: "lowcode-gpt.firebaseapp.com",
    projectId: "lowcode-gpt",
    storageBucket: "lowcode-gpt.firebasestorage.app",
    messagingSenderId: "345113426023",
    appId: "1:345113426023:web:6ab295605b8d828880bcc2",
    measurementId: "G-90SQ9SCSWH"
  };
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };