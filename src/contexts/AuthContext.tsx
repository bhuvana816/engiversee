import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  applyActionCode,
  reload,
  getAuth,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  sendWelcomeMessage, 
  sendVerificationMessage,
  validateWhatsAppNumber 
} from '../services/whatsappService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, phone: string, whatsapp: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isVerified: boolean;
  verifyEmail: (oobCode: string) => Promise<void>;
  checkEmailVerification: () => Promise<void>;
  resendVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  const updateVerificationStatus = async (user: User | null) => {
    if (user) {
      try {
        await reload(user);
        const verified = user.emailVerified;
        setIsVerified(verified);
        
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          isVerified: verified,
          lastLogin: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating verification status:', error);
        setIsVerified(false);
      }
    } else {
      setIsVerified(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await updateVerificationStatus(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkEmailVerification = async () => {
    if (currentUser) {
      await updateVerificationStatus(currentUser);
    }
  };

  const signup = async (email: string, password: string, name: string, phone: string, whatsapp: string) => {
    try {
      // Validate WhatsApp number
      if (!validateWhatsAppNumber(whatsapp)) {
        throw new Error('Please enter a valid WhatsApp number with country code');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name
      });

      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true
      };

      await sendEmailVerification(user, actionCodeSettings);
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name,
        displayName: name,
        phone,
        whatsapp,
        createdAt: new Date().toISOString(),
        isVerified: false
      });

      // Send WhatsApp messages
      try {
        await sendWelcomeMessage(name, whatsapp);
        
        // Get verification link
        const verificationLink = await getAuth().currentUser?.getIdToken();
        if (verificationLink) {
          await sendVerificationMessage(name, whatsapp, `${window.location.origin}/verify-email?token=${verificationLink}`);
        }
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp messages:', whatsappError);
        // Continue with the signup process even if WhatsApp messages fail
      }

      navigate('/verify-email');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      } else {
        throw error;
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateVerificationStatus(user);
      
      if (!user.emailVerified) {
        navigate('/verify-email');
        throw new Error('Please verify your email before logging in.');
      }
      
      navigate('/profile');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsVerified(false);
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (oobCode: string) => {
    try {
      await applyActionCode(auth, oobCode);
      if (currentUser) {
        await updateVerificationStatus(currentUser);
      }
      navigate('/profile');
    } catch (error) {
      throw error;
    }
  };

  const resendVerification = async () => {
    if (!currentUser) return;

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true
      };

      await sendEmailVerification(currentUser, actionCodeSettings);
      
      // Get user's WhatsApp number from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.whatsapp) {
          const verificationLink = await currentUser.getIdToken();
          await sendVerificationMessage(
            userData.name,
            userData.whatsapp,
            `${window.location.origin}/verify-email?token=${verificationLink}`
          );
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    isVerified,
    verifyEmail,
    checkEmailVerification,
    resendVerification,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};