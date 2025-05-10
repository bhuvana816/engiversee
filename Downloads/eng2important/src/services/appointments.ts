import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Booking {
  userName: string;
  userEmail: string;
  sessionType: string;
  sessionTitle: string;
  date: string;
  time: string;
  status: string; // Should be 'Upcoming' or 'Completed'
  userId: string;
  reference?: string;
  id?: string;
  sessionId?: string;
  bookingType?: string;
}

export const createBooking = async (bookingData: Omit<Booking, 'status'>) => {
  // Set status to 'Upcoming' for new bookings
  const booking = {
    ...bookingData,
    status: 'Upcoming'
  };
  console.log('createBooking called with:', booking);
  try {
    const docRef = await addDoc(collection(db, 'bookings'), booking);
    return { id: docRef.id, ...booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Booking;
      return {
        id: doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const deleteBooking = async (id: string, sessionId?: string) => {
  try {
    await deleteDoc(doc(db, 'bookings', id));
    if (sessionId) {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        enrolled: increment(-1)
      });
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}; 