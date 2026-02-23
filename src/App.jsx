import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Calendar from './components/Calendar/Calendar';
import Login from './components/Auth/Login';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("Médico logueado con UID:", currentUser.uid); // <--- DEBUG
        try {
          const docRef = doc(db, "medicos", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            console.log("Datos encontrados:", docSnap.data()); // <--- DEBUG
            setUserData(docSnap.data());
          } else {
            console.log("¡ERROR! No existe el documento con ese UID en la colección 'medicos'");
          }
        } catch (error) {
          console.error("Error de Firestore:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
  return () => unsubscribe();
}, []);

  // Pantalla de carga profesional
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Iniciando Sistema...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {user ? (
        <>
          {/* BARRA DE NAVEGACIÓN INTEGRADA */}
          <nav className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-blue-600 tracking-tight leading-none">
                OdontoApp
              </h1>
              {userData && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1"
                >
                  Dr/a. {userData.nombre}
                </motion.span>
              )}
            </div>
            
            <button 
              onClick={() => auth.signOut()}
              className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 active:scale-95 shadow-sm"
            >
              Cerrar Sesión
            </button>
          </nav>

          {/* CUERPO DE LA APP: Pasamos el objeto user al calendario */}
          <main className="p-0 md:p-4">
            <Calendar user={user} />
          </main>
        </>
      ) : (
        <Login onLoginSuccess={() => {}} />
      )}
    </div>
  );
}

export default App;