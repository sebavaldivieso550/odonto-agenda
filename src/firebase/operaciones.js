import { db } from "./config";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

// AGREGAR TURNO
export const agregarTurno = async (turnoData) => {
  try {
    const docRef = await addDoc(collection(db, "turnos"), turnoData);
    return docRef.id;
  } catch (e) {
    console.error("Error al agregar turno: ", e);
  }
};

// OBTENER TURNOS DEL MÉDICO
export const getTurnosMedico = async (medicoId) => {
  const q = query(collection(db, "turnos"), where("medicoId", "==", medicoId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};