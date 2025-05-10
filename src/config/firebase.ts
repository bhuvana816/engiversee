import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
  groupInviteLink: 'https://chat.whatsapp.com/DMRK5sOdBBACqZgl49SOOw',
  groupName: 'ENGIVERSEE EVENTS',
  welcomeMessage: (name: string) => `Welcome to Engiversee, ${name}! 🎉\n\nThank you for registering with us. We're excited to have you on board and help you in your engineering journey.\n\nJoin our WhatsApp group for updates and discussions: https://chat.whatsapp.com/DMRK5sOdBBACqZgl49SOOw\n\nBest regards,\nThe Engiversee Team`
};
