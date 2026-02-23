import React, { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, User } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="max-w-full lg:max-w-7xl mx-auto p-2 md:p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-blue-200 shadow-lg">
            <CalendarIcon className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize leading-tight">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <p className="text-slate-400 text-sm font-medium">Panel de Control de Turnos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <div className="flex gap-1 border-r border-slate-200 pr-2">
            <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
              <span className="text-xs font-bold mr-1">Mes</span>
              <ChevronLeft size={18} className="inline"/>
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
              <ChevronRight size={18} className="inline"/>
              <span className="text-xs font-bold ml-1">Mes</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="p-2 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all border border-slate-200">
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">Semana</span>
            <button onClick={nextWeek} className="p-2 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all border border-slate-200">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE GRILLA CON SCROLL HORIZONTAL EN MÓVIL */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-7 gap-3 min-w-[800px] lg:min-w-full">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toString()} className="flex flex-col gap-3">
                
                {/* Cabecera del día */}
                <div className={`text-center py-4 rounded-2xl transition-all border ${
                  isToday 
                  ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-100' 
                  : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>
                    {format(day, 'eeee', { locale: es })}
                  </p>
                  <p className={`text-2xl font-black ${isToday ? 'text-white' : 'text-slate-700'}`}>
                    {format(day, 'd')}
                  </p>
                </div>

                {/* Celda del día */}
                <div className={`relative bg-white rounded-2xl min-h-[500px] p-2 border-2 transition-all ${
                  isToday ? 'border-blue-100 bg-blue-50/20' : 'border-transparent'
                } hover:border-blue-200 shadow-sm`}>
                   
                   {/* Botón flotante para agregar (Desktop) */}
                   <button className="w-full mb-3 flex items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl opacity-0 group-hover:opacity-100 lg:opacity-100 transition-all border border-blue-100 border-dashed">
                     <Plus size={14} /> Nuevo Turno
                   </button>
                   
                   {/* Turnos MOCKUP con mejor diseño */}
                   <div className="space-y-3">
                     <div className="group cursor-pointer bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={12} className="text-blue-500" />
                          <span className="text-[11px] font-bold text-slate-700 truncate uppercase">Juan Pérez</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 bg-slate-50 w-fit px-1.5 py-0.5 rounded">09:30 AM</p>
                     </div>

                     <div className="group cursor-pointer bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={12} className="text-emerald-500" />
                          <span className="text-[11px] font-bold text-slate-700 truncate uppercase">Maria Gomez</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 bg-slate-50 w-fit px-1.5 py-0.5 rounded">11:00 AM</p>
                     </div>
                   </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-6 flex justify-center">
        <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Confirmado</div>
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Atendido</div>
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendiente</div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;