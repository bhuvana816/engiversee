import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Session {
  id: string;
  title: string;
  domain: string;
  date: string;
  time: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Helper function for date formatting
function formatDMY(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
}

// Helper function for 12-hour time with am/pm
function formatTime12h(time: string) {
  // If already in 12-hour format, just return
  if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) return time;
  // If time is "07:30", convert to "07:30 AM"
  const [h, m] = time.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${m} ${ampm}`;
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    domain: '',
    level: ''
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const sessionsQuery = query(collection(db, 'sessions'));
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessionsData = sessionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Session[];
        setSessions(sessionsData);
        setFilteredSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    // Apply filters whenever sessions or filter changes
    const filtered = sessions.filter(session => {
      const domainMatch = filter.domain === '' || session.domain === filter.domain;
      const levelMatch = filter.level === '' || session.level === filter.level;
      return domainMatch && levelMatch;
    });
    setFilteredSessions(filtered);
  }, [sessions, filter]);

  const handleBookNow = (session: Session) => {
    setSelectedSession(session);
    setShowConfirm(true);
  };

  const confirmBooking = async () => {
    if (!currentUser || !selectedSession) {
      setShowConfirm(false);
      return;
    }
    try {
      if (selectedSession.enrolled >= selectedSession.capacity) {
        alert('This session is already full. Please choose another session.');
        setShowConfirm(false);
        return;
      }
      // Create booking
      await addDoc(collection(db, 'bookings'), {
        userId: currentUser.uid,
        sessionId: selectedSession.id,
        sessionTitle: selectedSession.title,
        date: selectedSession.date,
        time: selectedSession.time,
        instructor: selectedSession.instructor,
        status: 'booked',
        createdAt: serverTimestamp(),
        bookingType: 'session'
      });
      // Update session enrollment count
      const sessionRef = doc(db, 'sessions', selectedSession.id);
      await updateDoc(sessionRef, {
        enrolled: increment(1)
      });
      // Update local state
      setSessions(prevSessions => 
        prevSessions.map(s => 
          s.id === selectedSession.id 
            ? { ...s, enrolled: s.enrolled + 1 }
            : s
        )
      );
      setShowConfirm(false);
      setSelectedSession(null);
      alert('Booking confirmed!');
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book the session. Please try again.');
      setShowConfirm(false);
      setSelectedSession(null);
    }
  };

  const cancelBooking = () => {
    setShowConfirm(false);
    setSelectedSession(null);
  };

  const handleFilterChange = (key: 'domain' | 'level', value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: prev[key] === value ? '' : value,
    }));
  };

  // Get unique domains for filtering
  const domains = Array.from(new Set(sessions.map(session => session.domain)));
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <>
      <SEO 
        title="Search Sessions" 
        description="Find and book educational sessions with Engiversee."
      />
      
      <section className="section bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain
                    </label>
                    <select
                      value={filter.domain}
                      onChange={(e) => setFilter(prev => ({ ...prev, domain: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Domains</option>
                      <option value="Web Development">Web Development</option>
                      <option value="App Development">App Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="AI & ML">AI & ML</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <select
                      value={filter.level}
                      onChange={(e) => setFilter(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl font-bold">
                    {loading
                      ? 'Loading sessions...'
                      : filteredSessions.length > 0
                      ? `${filteredSessions.length} Session${filteredSessions.length > 1 ? 's' : ''} Found`
                      : 'No sessions found'}
                  </h2>
                  
                  {Object.values(filter).some(v => v !== '') && (
                    <button
                      onClick={() => setFilter({ domain: '', level: '' })}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading sessions...</p>
                </div>
              ) : filteredSessions.length > 0 ? (
                <div className="space-y-6">
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              session.domain === 'Web Development'
                                ? 'bg-blue-100 text-blue-700'
                                : session.domain === 'App Development'
                                ? 'bg-green-100 text-green-700'
                                : session.domain === 'Data Science'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {session.domain}
                            </span>
                            <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {session.level}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mt-4 mb-2">{session.title}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm">{formatDMY(session.date)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm">{formatTime12h(session.time)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-sm">Instructor: {session.instructor}</span>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(session.enrolled / session.capacity) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {session.capacity - session.enrolled} spots remaining
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => handleBookNow(session)}
                            disabled={session.enrolled >= session.capacity}
                            className={`px-4 py-2 rounded-md transition-colors ${
                              session.enrolled >= session.capacity
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {session.enrolled >= session.capacity ? 'Session Full' : 'Book Now'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No sessions found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any sessions matching your search criteria. Try adjusting your filters or search term.
                  </p>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/search');
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View All Sessions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Booking Confirmation Modal */}
      {showConfirm && selectedSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Your Booking</h3>
            <p className="mb-6">Are you sure you want to book <span className="font-semibold">{selectedSession.title}</span> session on <span className="font-semibold">{formatDMY(selectedSession.date)}</span> at <span className="font-semibold">{formatTime12h(selectedSession.time)}</span>?</p>
            <div className="flex justify-end gap-4">
              <button onClick={cancelBooking} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">No</button>
              <button onClick={confirmBooking} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Yes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchResultsPage;