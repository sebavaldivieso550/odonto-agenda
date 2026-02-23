import React, { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, User, Phone, Clock, Trash2, CheckCircle, Edit3, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FIREBASE IMPORTS
import { db } from "../../firebase/config";
import { 
  collection, addDoc, query, where, onSnapshot, 
  doc, deleteDoc, updateDoc 
} from "firebase/firestore";

const Calendar = ({ user }) => {
  // --- ESTADOS ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [turnos, setTurnos] = useState([]);

  const [formData, setFormData] = useState({
    pacienteNombre: '',
    pacienteTelefono: '',
    hora: '09:00'
  });

  // --- UTILIDADES ---
  
  // Limpia el número para Argentina: quita 0, quita 15 y agrega 549
  const formatearTelefonoArgentina = (tel) => {
    if (!tel) return '';
    let limpio = tel.replace(/\D/g, ''); // Solo números
    if (limpio.startsWith('0')) limpio = limpio.substring(1); // Quita 0 inicial
    
    // Si tiene el 15 (común en celulares AR), intentamos removerlo 
    // si el número resultante queda de 10 dígitos (característica + número)
    if (limpio.length === 12 && limpio.includes('15')) {
        limpio = limpio.replace('15', '');
    } else if (limpio.length === 11 && limpio.startsWith('15')) {
        limpio = limpio.substring(2);
    }
    
    // Si tenemos los 10 dígitos base (ej: 1167890123), sumamos el prefijo internacional
    if (limpio.length === 10) return `549${limpio}`;
    return limpio;
  };

  // --- ESCUCHA DE TURNOS ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "turnos"), where("medicoId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha?.toDate() || new Date()
      }));
      setTurnos(turnosData);
    });
    return () => unsubscribe();
  }, [user]);

  // --- FUNCIONES CALENDARIO ---
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Empieza en Lunes
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));
  const nextWeek = () => { setDirection(1); setCurrentDate(addWeeks(currentDate, 1)); };
  const prevWeek = () => { setDirection(-1); setCurrentDate(subWeeks(currentDate, 1)); };

  // --- ACCIONES FIREBASE ---
  const guardarNuevoTurno = async (e) => {
    e.preventDefault();
    try {
      const [horas, minutos] = formData.hora.split(':');
      const fechaTurno = new Date(selectedDate);
      fechaTurno.setHours(parseInt(horas), parseInt(minutos), 0);

      await addDoc(collection(db, "turnos"), {
        medicoId: user.uid,
        pacienteNombre: formData.pacienteNombre,
        pacienteTelefono: formatearTelefonoArgentina(formData.pacienteTelefono),
        fecha: fechaTurno,
        estado: 'confirmado'
      });
      setIsModalOpen(false);
      setFormData({ pacienteNombre: '', pacienteTelefono: '', hora: '09:00' });
    } catch (error) { console.error(error); }
  };

  const actualizarTurno = async (e) => {
    e.preventDefault();
    try {
      const [horas, minutos] = formData.hora.split(':');
      const nuevaFecha = new Date(selectedTurno.fecha);
      nuevaFecha.setHours(parseInt(horas), parseInt(minutos), 0);

      await updateDoc(doc(db, "turnos", selectedTurno.id), {
        pacienteNombre: formData.pacienteNombre,
        pacienteTelefono: formatearTelefonoArgentina(formData.pacienteTelefono),
        fecha: nuevaFecha
      });
      setIsEditing(false);
      setIsEditModalOpen(false);
    } catch (error) { console.error(error); }
  };

  const eliminarTurno = async (id) => {
    if (window.confirm("¿Eliminar este turno definitivamente?")) {
      await deleteDoc(doc(db, "turnos", id));
      setIsEditModalOpen(false);
    }
  };

  const marcarAtendido = async (id) => {
    await updateDoc(doc(db, "turnos", id), { estado: 'atendido' });
    setIsEditModalOpen(false);
  };

  return (
    <div className="max-w-full lg:max-w-7xl mx-auto p-2 md:p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-lg shadow-blue-200">
            <CalendarIcon className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={prevWeek} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"><ChevronLeft/></button>
           <button onClick={nextWeek} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"><ChevronRight/></button>
        </div>
      </div>

      {/* GRILLA */}
      <div className="overflow-x-hidden pb-4">
        <motion.div key={currentDate.getTime()} className="grid grid-cols-7 gap-3 min-w-[800px] lg:min-w-full">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            const turnosDelDia = turnos.filter(t => isSameDay(t.fecha, day)).sort((a, b) => a.fecha - b.fecha);
            return (
              <div key={day.toString()} className="flex flex-col gap-3">
                <div className={`text-center py-3 rounded-2xl border ${isToday ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 shadow-sm border-slate-100'}`}>
                  <p className="text-[10px] uppercase font-black opacity-70">{format(day, 'eee', { locale: es })}</p>
                  <p className="text-xl font-black">{format(day, 'd')}</p>
                </div>

                <div className={`bg-white rounded-2xl min-h-[500px] p-2 border-2 transition-all ${isToday ? 'border-blue-100 bg-blue-50/20' : 'border-transparent'} hover:border-blue-200 shadow-sm`}>
                  <button onClick={() => { setSelectedDate(day); setFormData({pacienteNombre:'', pacienteTelefono:'', hora:'09:00'}); setIsModalOpen(true); }} className="w-full mb-3 py-2 text-[10px] font-bold uppercase text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 border-dashed">
                    <Plus size={14} className="inline mr-1" /> Nuevo
                  </button>
                  
                  <div className="space-y-2">
                    {turnosDelDia.map((turno) => (
                      <div key={turno.id} onClick={() => { 
                        setSelectedTurno(turno); 
                        setFormData({ pacienteNombre: turno.pacienteNombre, pacienteTelefono: turno.pacienteTelefono, hora: format(turno.fecha, 'HH:mm') });
                        setIsEditing(false);
                        setIsEditModalOpen(true); 
                      }} className={`cursor-pointer bg-white border p-3 rounded-xl border-l-4 transition-all ${turno.estado === 'atendido' ? 'border-emerald-500 opacity-60' : 'border-blue-500 hover:scale-[1.02]'}`}>
                        <p className="text-[11px] font-bold text-slate-700 uppercase truncate">{turno.pacienteNombre}</p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Clock size={10}/> {format(turno.fecha, 'HH:mm')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* MODAL NUEVO TURNO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Agendar Turno</h3>
              <form onSubmit={guardarNuevoTurno} className="space-y-4">
                <input required placeholder="Nombre del Paciente" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, pacienteNombre: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Área + Número (sin 15)" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, pacienteTelefono: e.target.value})} />
                  <input required type="time" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100">Confirmar Turno</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GESTIÓN / EDICIÓN TURNO */}
      <AnimatePresence>
        {isEditModalOpen && selectedTurno && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => {setIsEditModalOpen(false); setIsEditing(false);}} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              
              <div className={`${selectedTurno.estado === 'atendido' ? 'bg-emerald-500' : 'bg-blue-600'} p-6 text-white flex justify-between items-center transition-colors`}>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">
                    {isEditing ? 'Editando Turno' : 'Detalles del Turno'}
                  </h3>
                  <p className="text-xs opacity-80">{format(selectedTurno.fecha, "dd 'de' MMMM", { locale: es })}</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all">
                    <Edit3 size={20} />
                  </button>
                )}
              </div>

              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={actualizarTurno} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Paciente</label>
                      <input required value={formData.pacienteNombre} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, pacienteNombre: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">WhatsApp</label>
                        <input value={formData.pacienteTelefono} placeholder="11 6789 0123" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, pacienteTelefono: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Hora</label>
                        <input required type="time" value={formData.hora} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, hora: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Volver</button>
                      <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                        <Save size={18}/> Guardar Cambios
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                      <div className="bg-white p-3 rounded-xl shadow-sm"><User className="text-blue-500"/></div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Paciente</p>
                        <p className="font-bold text-slate-700">{selectedTurno.pacienteNombre}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                         <p className="text-[10px] text-slate-400 uppercase font-bold">Horario</p>
                         <p className="font-bold text-slate-700 flex items-center gap-1"><Clock size={14}/> {format(selectedTurno.fecha, 'HH:mm')}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                         <p className="text-[10px] text-slate-400 uppercase font-bold">Estado</p>
                         <p className={`font-bold capitalize ${selectedTurno.estado === 'atendido' ? 'text-emerald-600' : 'text-blue-600'}`}>{selectedTurno.estado}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                      {selectedTurno.pacienteTelefono && (
                        <a href={`https://wa.me/${selectedTurno.pacienteTelefono}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold border border-emerald-100 hover:bg-emerald-100 transition-all">
                          <Phone size={18} /> Chatear por WhatsApp
                        </a>
                      )}
                      {selectedTurno.estado !== 'atendido' && (
                        <button onClick={() => marcarAtendido(selectedTurno.id)} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">
                          <CheckCircle size={18} /> Marcar como Atendido
                        </button>
                      )}
                      <button onClick={() => eliminarTurno(selectedTurno.id)} className="w-full py-3 text-red-400 text-sm font-bold hover:bg-red-50 rounded-xl transition-all">
                        Eliminar Turno
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;