import React, { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, User, Phone, Clock, Trash2, CheckCircle, Edit3, Save, X, Activity, CreditCard } from 'lucide-react';
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

  // Estados de formulario ampliados
  const [formData, setFormData] = useState({
    pacienteNombre: '',
    pacienteTelefono: '',
    hora: '09:00',
    practica: '',
    obraSocial: ''
  });

  // --- UTILIDADES ---
  const formatearTelefonoArgentina = (tel) => {
    if (!tel) return '';
    let limpio = tel.replace(/\D/g, '');
    if (limpio.startsWith('0')) limpio = limpio.substring(1);
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
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
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
        practica: formData.practica,
        obraSocial: formData.obraSocial,
        fecha: fechaTurno,
        estado: 'confirmado'
      });
      
      setIsModalOpen(false);
      setFormData({ pacienteNombre: '', pacienteTelefono: '', hora: '09:00', practica: '', obraSocial: '' });
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
        practica: formData.practica,
        obraSocial: formData.obraSocial,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-blue-600 p-2 md:p-2.5 rounded-lg shadow-lg shadow-blue-200">
            <CalendarIcon className="text-white" size={20} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
        </div>
        <div className="flex justify-between md:justify-end gap-2">
           <button onClick={prevWeek} className="flex-1 md:flex-none p-2 bg-white rounded-xl border border-slate-200"><ChevronLeft size={20}/></button>
           <button onClick={nextWeek} className="flex-1 md:flex-none p-2 bg-white rounded-xl border border-slate-200"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* GRILLA CON SWIPE */}
      <div className="pb-8 overflow-hidden touch-pan-y">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentDate.getTime()}
            custom={direction}
            variants={{
              enter: (d) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d) => ({ x: d < 0 ? 100 : -100, opacity: 0 })
            }}
            initial="enter" animate="center" exit="exit"
            drag="x" dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset }) => {
              if (offset.x < -50) nextWeek();
              else if (offset.x > 50) prevWeek();
            }}
            className="grid grid-cols-1 md:grid-cols-7 gap-4"
          >
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const turnosDelDia = turnos.filter(t => isSameDay(t.fecha, day)).sort((a, b) => a.fecha - b.fecha);
              
              return (
                <div key={day.toString()} className="flex flex-col gap-2">
                  <div className={`flex md:flex-col items-center justify-between px-4 py-3 rounded-2xl border ${isToday ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border-slate-100 shadow-sm'}`}>
                    <div className="flex flex-col md:items-center">
                      <p className="text-[10px] uppercase font-black opacity-70 mb-1">{format(day, 'eeee', { locale: es })}</p>
                      <p className="text-xl font-black">{format(day, 'd')}</p>
                    </div>
                    <button onClick={() => { setSelectedDate(day); setFormData({pacienteNombre:'', pacienteTelefono:'', hora:'09:00', practica: '', obraSocial: ''}); setIsModalOpen(true); }} className="md:hidden bg-blue-500/20 p-2 rounded-full text-current"><Plus size={20} /></button>
                  </div>

                  <div className={`bg-white rounded-2xl md:min-h-[500px] p-2 border-2 transition-all ${isToday ? 'border-blue-100 bg-blue-50/10' : 'border-transparent'} shadow-sm`}>
                    <button onClick={() => { setSelectedDate(day); setFormData({pacienteNombre:'', pacienteTelefono:'', hora:'09:00', practica: '', obraSocial: ''}); setIsModalOpen(true); }} className="hidden md:block w-full mb-3 py-2 text-[10px] font-bold uppercase text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 border-dashed">
                      <Plus size={14} className="inline mr-1" /> Nuevo
                    </button>
                    
                    <div className="flex flex-col gap-2">
                      {turnosDelDia.map((turno) => (
                        <div key={turno.id} onClick={() => { 
                          setSelectedTurno(turno); 
                          setFormData({ 
                            pacienteNombre: turno.pacienteNombre, 
                            pacienteTelefono: turno.pacienteTelefono, 
                            hora: format(turno.fecha, 'HH:mm'),
                            practica: turno.practica || '',
                            obraSocial: turno.obraSocial || ''
                          });
                          setIsEditing(false);
                          setIsEditModalOpen(true); 
                        }} className={`cursor-pointer bg-white border p-3 rounded-xl border-l-4 transition-all shadow-sm ${turno.estado === 'atendido' ? 'border-emerald-500 opacity-60' : 'border-blue-500 hover:border-blue-600'}`}>
                          <div className="flex justify-between items-start mb-1">
                             <p className="text-[11px] font-bold text-slate-700 uppercase truncate pr-2">{turno.pacienteNombre}</p>
                             <p className="text-[10px] font-bold text-blue-600">{format(turno.fecha, 'HH:mm')}</p>
                          </div>
                          {/* Pequeño detalle de práctica en la tarjeta */}
                          {turno.practica && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate italic">
                              <Activity size={10} /> {turno.practica}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MODAL NUEVO TURNO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-md rounded-t-[32px] md:rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden" />
              <h3 className="text-xl font-bold mb-6 text-slate-800">Agendar Turno</h3>
              <form onSubmit={guardarNuevoTurno} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Paciente</label>
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, pacienteNombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">WhatsApp</label>
                    <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, pacienteTelefono: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Hora</label>
                    <input required type="time" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-3 outline-none focus:border-blue-500" value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Práctica / Detalle</label>
                    <input placeholder="Ej: Control, Limpieza..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, practica: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Obra Social</label>
                    <input placeholder="Ej: OSDE, Galeno, Particular" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, obraSocial: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg mt-4 active:scale-95 transition-transform">Confirmar Cita</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GESTIÓN / DETALLES */}
      <AnimatePresence>
        {isEditModalOpen && selectedTurno && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div onClick={() => {setIsEditModalOpen(false); setIsEditing(false);}} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-md rounded-t-[32px] md:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
              <div className={`${selectedTurno.estado === 'atendido' ? 'bg-emerald-500' : 'bg-blue-600'} p-6 text-white flex justify-between items-center`}>
                <div>
                  <h3 className="text-xl font-bold uppercase">{isEditing ? 'Editar Turno' : 'Detalles'}</h3>
                  <p className="text-xs opacity-80">{format(selectedTurno.fecha, "eeee dd 'de' MMMM", { locale: es })}</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all"><Edit3 size={20} /></button>
                )}
              </div>

              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={actualizarTurno} className="space-y-4">
                    <input required value={formData.pacienteNombre} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4" onChange={(e) => setFormData({...formData, pacienteNombre: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input value={formData.pacienteTelefono} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4" onChange={(e) => setFormData({...formData, pacienteTelefono: e.target.value})} />
                        <input required type="time" value={formData.hora} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4" onChange={(e) => setFormData({...formData, hora: e.target.value})} />
                    </div>
                    <input placeholder="Práctica" value={formData.practica} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4" onChange={(e) => setFormData({...formData, practica: e.target.value})} />
                    <input placeholder="Obra Social" value={formData.obraSocial} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4" onChange={(e) => setFormData({...formData, obraSocial: e.target.value})} />
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancelar</button>
                      <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"><Save size={18}/> Guardar</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                      <div className="bg-white p-3 rounded-xl shadow-sm"><User className="text-blue-500"/></div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Paciente</p>
                        <p className="font-bold text-slate-700 text-lg leading-tight">{selectedTurno.pacienteNombre}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                         <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><Activity size={10}/> Práctica</p>
                         <p className="font-bold text-slate-700 text-sm">{selectedTurno.practica || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                         <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><CreditCard size={10}/> Obra Social</p>
                         <p className="font-bold text-slate-700 text-sm">{selectedTurno.obraSocial || 'Particular'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                      <div className="bg-white p-3 rounded-xl shadow-sm"><Clock className="text-blue-500"/></div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Horario</p>
                        <p className="font-bold text-slate-700 text-lg">{format(selectedTurno.fecha, 'HH:mm')} hs</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      {selectedTurno.pacienteTelefono && (
                        <a href={`https://wa.me/${selectedTurno.pacienteTelefono}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold border border-emerald-100 active:bg-emerald-100 transition-all">
                          <Phone size={20} /> WhatsApp
                        </a>
                      )}
                      {selectedTurno.estado !== 'atendido' && (
                        <button onClick={() => marcarAtendido(selectedTurno.id)} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                          <CheckCircle size={20} /> Marcar Atendido
                        </button>
                      )}
                      <button onClick={() => eliminarTurno(selectedTurno.id)} className="w-full py-3 text-red-400 text-sm font-bold hover:bg-red-50 rounded-2xl transition-all">Eliminar Cita</button>
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