import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Session {
  date: string;
  time: string;
  topic: string;
  maxBookings: number;
  currentBookings: number;
  domain: string;
  instructor: string;
  level: string;
}

const SessionManager: React.FC = () => {
  const [session, setSession] = useState<Session>({
    date: '',
    time: '',
    topic: '',
    maxBookings: 1,
    currentBookings: 0,
    domain: '',
    instructor: '',
    level: 'Beginner',
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log('Your UID is:', currentUser.uid);
    }
  }, [currentUser]);

  const ADMIN_UID = 'GKPrecSThhSVDK3KLO7X8JzipC43';

  if (!currentUser || currentUser.uid !== ADMIN_UID) {
    return null; 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionsRef = collection(db, 'sessions');
      await addDoc(sessionsRef, {
        title: session.topic,
        domain: session.domain,
        instructor: session.instructor,
        level: session.level,
        date: session.date,
        time: session.time,
        capacity: session.maxBookings,
        enrolled: session.currentBookings,
        createdAt: serverTimestamp(),
        status: 'available',
      });
      
      // Reset form
      setSession({
        date: '',
        time: '',
        topic: '',
        maxBookings: 1,
        currentBookings: 0,
        domain: '',
        instructor: '',
        level: 'Beginner',
      });
      
      alert('Session added successfully!');
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Error adding session. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={session.date}
            onChange={(e) => setSession({ ...session, date: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <input
            type="time"
            value={session.time}
            onChange={(e) => setSession({ ...session, time: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Topic</label>
          <input
            type="text"
            value={session.topic}
            onChange={(e) => setSession({ ...session, topic: e.target.value })}
            required
            placeholder="Enter session topic"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Maximum Bookings</label>
          <input
            type="number"
            value={session.maxBookings}
            onChange={(e) => setSession({ ...session, maxBookings: parseInt(e.target.value) })}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Domain</label>
          <select
            value={session.domain}
            onChange={(e) => setSession({ ...session, domain: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select domain</option>
            <option value="Web Development">Web Development</option>
            <option value="App Development">App Development</option>
            <option value="Data Science">Data Science</option>
            <option value="AI & ML">AI & ML</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Instructor</label>
          <input
            type="text"
            value={session.instructor}
            onChange={(e) => setSession({ ...session, instructor: e.target.value })}
            required
            placeholder="Enter instructor name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <select
            value={session.level}
            onChange={(e) => setSession({ ...session, level: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Session
        </button>
      </form>
    </div>
  );
};

export default SessionManager; 