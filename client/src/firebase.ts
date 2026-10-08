import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Municipal Control Center Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3cP-9Nr4GvJlUXOWpyr0WF9UCwSgxA94",
  authDomain: "zenzy-9a7dd.firebaseapp.com",
  databaseURL: "https://zenzy-9a7dd-default-rtdb.firebaseio.com",
  projectId: "zenzy-9a7dd",
  storageBucket: "zenzy-9a7dd.firebasestorage.app",
  messagingSenderId: "964540956175",
  appId: "1:964540956175:web:d9840046d4386af407ed7a"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
