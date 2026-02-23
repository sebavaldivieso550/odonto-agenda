import React, { useState } from 'react';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { User, Lock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onLoginSuccess }) => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Convertimos DNI a formato email para Firebase
    const virtualEmail = `${dni}@odontoapp.com`;

    try {
      await signInWithEmailAndPassword(auth, virtualEmail, password);
      onLoginSuccess();
    } catch (err) {
      setError('DNI o contraseña incorrectos. Verifica tus datos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Activity className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">OdontoApp</h2>
          <p className="text-slate-400 font-medium">Ingresa a tu agenda médica</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-1">DNI Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                placeholder="Tu número de documento"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg italic">
              {error}
            </p>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all text-lg"
          >
            Iniciar Sesión
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;