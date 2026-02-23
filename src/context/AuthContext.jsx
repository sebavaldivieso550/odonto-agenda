import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para Loguear con DNI
  const login = async (dni, password) => {
    const email = `${dni}@tuagenda.com`; // Formato interno
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscamos los datos extra del médico en Firestore (especialidad, nombre real)
        const docRef = doc(db, "medicos", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        setUser({ ...firebaseUser, ...docSnap.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);