import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName,
      createdAt: new Date()
    });
    
    return user;
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              ...userDoc.data()
            });
          } else {
            // If user doc doesn't exist, create it
            try {
              await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                displayName: user.email.split('@')[0],
                createdAt: new Date()
              });
            } catch (createError) {
              console.warn('Could not create user document:', createError);
            }
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.email.split('@')[0],
              createdAt: new Date()
            });
          }
        } catch (error) {
          // Silently handle blocked requests or connection issues
          if (error.code !== 'unavailable') {
            console.warn('Error fetching user data:', error.message);
          }
          // Set basic user info even if Firestore fetch fails
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.email.split('@')[0]
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
