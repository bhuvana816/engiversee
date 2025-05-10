import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Calendar, BookOpen, Edit2, Save, X, Github, Linkedin, Mail, Phone, Clock, MapPin, ChevronRight, MessageCircle } from 'lucide-react';
import SEO from '../components/common/SEO';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin?: string;
  github?: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  sessionType: string;
  status: 'booked' | 'completed' | 'cancelled';
  reference: string;
}

interface Session {
  id: string;
  title: string;
  instructor: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

const ProfilePage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'appointments' | 'sessions'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileCompletionPrompt, setShowProfileCompletionPrompt] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch profile data
        const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', currentUser.email)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data() as ProfileData;
          setProfileData(userData);
          
          // Check if profile needs completion
          if (!userData.name || !userData.email || !userData.phone || !userData.whatsapp) {
            setShowProfileCompletionPrompt(true);
          }
        }

        // Fetch appointments
        const appointmentsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Appointment[];
        setAppointments(appointmentsData);

        // Fetch sessions
        const sessionsQuery = query(
          collection(db, 'sessions'),
          where('userId', '==', currentUser.uid),
          orderBy('startDate', 'desc')
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessionsData = sessionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Session[];
        setSessions(sessionsData);

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!profileData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!profileData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!profileData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number with country code';
    }

    if (!profileData?.whatsapp?.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(profileData.whatsapp)) {
      newErrors.whatsapp = 'Please enter a valid WhatsApp number with country code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value
      };
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', currentUser?.email)));
      if (!userDoc.empty) {
        const docRef = doc(db, 'users', userDoc.docs[0].id);
        await updateDoc(docRef, {
          ...profileData,
          updatedAt: new Date()
        });
        setShowProfileCompletionPrompt(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Please log in to view your profile</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO title="Profile | Engiversee" />
      
      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-6"
          >
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <User className="h-16 w-16 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{profileData?.name || 'User'}</h1>
              <p className="mt-2 text-gray-600 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                {profileData?.email}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Prompt */}
        {showProfileCompletionPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-blue-800">Complete Your Profile</h3>
                <p className="mt-1 text-blue-700">
                  Please add your name, email, phone number, and WhatsApp number. These fields are required.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <nav className="flex space-x-8 px-6 py-4">
            {['profile', 'appointments', 'sessions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'profile' | 'appointments' | 'sessions')}
                className={`${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <div className="flex items-center space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      <Edit2 className="h-5 w-5" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200"
                      >
                        <X className="h-5 w-5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={profileData?.name || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-900">{profileData?.name}</p>
                        </div>
                      )}
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={profileData?.email || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center">
                          <Mail className="h-5 w-5 mr-2 text-gray-400" />
                          <p className="text-gray-900">{profileData?.email}</p>
                        </div>
                      )}
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={profileData?.phone || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number with country code (e.g., +1234567890)"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center">
                          <Phone className="h-5 w-5 mr-2 text-gray-400" />
                          <p className="text-gray-900">{profileData?.phone || 'Not provided'}</p>
                        </div>
                      )}
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="tel"
                          name="whatsapp"
                          value={profileData?.whatsapp || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your WhatsApp number with country code (e.g., +1234567890)"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.whatsapp ? 'border-red-300' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center">
                          <MessageCircle className="h-5 w-5 mr-2 text-gray-400" />
                          <p className="text-gray-900">{profileData?.whatsapp || 'Not provided'}</p>
                        </div>
                      )}
                      {errors.whatsapp && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.whatsapp}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="linkedin"
                        value={profileData?.linkedin || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your LinkedIn profile URL"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center">
                        <Linkedin className="h-5 w-5 mr-2 text-gray-400" />
                        <p className="text-gray-900">{profileData?.linkedin || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="github"
                        value={profileData?.github || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your GitHub profile URL"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center">
                        <Github className="h-5 w-5 mr-2 text-gray-400" />
                        <p className="text-gray-900">{profileData?.github || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.sessionType}</h3>
                    <div className="mt-2 flex items-center text-gray-500">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{formatDate(appointment.date)}</span>
                      <Clock className="h-5 w-5 ml-4 mr-2" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === 'booked'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Reference: {appointment.reference}</span>
                  <button className="text-blue-600 hover:text-blue-700 flex items-center">
                    <span>View Details</span>
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                <div className="mt-2 flex items-center text-gray-500">
                  <User className="h-5 w-5 mr-2" />
                  <span>{session.instructor}</span>
                </div>
                <div className="mt-2 flex items-center text-gray-500">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatDate(session.startDate)} - {formatDate(session.endDate)}</span>
                </div>
                <div className="mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : session.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 