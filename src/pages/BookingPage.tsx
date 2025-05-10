import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Check } from 'lucide-react';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import { sendBookingConfirmationEmail } from '../services/emailService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface SessionType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

const BookingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
  const [booking, setBooking] = useState<{
    completed: boolean;
    reference?: string;
  }>({
    completed: false,
    reference: '',
  });

  const sessionTypes: SessionType[] = [
    {
      id: 'webdev',
      title: 'Web Development',
      description: 'Learn modern web development technologies like React, Angular, and Node.js.',
      icon: <Calendar className="h-10 w-10 text-blue-600" />,
    },
    {
      id: 'appdev',
      title: 'App Development',
      description: 'Mobile app development with React Native, Flutter, and native Android/iOS.',
      icon: <Users className="h-10 w-10 text-green-600" />,
    },
    {
      id: 'datascience',
      title: 'Data Science',
      description: 'Data analysis, visualization, and machine learning foundations.',
      icon: <Clock className="h-10 w-10 text-purple-600" />,
    },
    {
      id: 'aiml',
      title: 'AI & Machine Learning',
      description: 'AI concepts, machine learning algorithms, and neural networks.',
      icon: <Check className="h-10 w-10 text-orange-600" />,
    },
  ];

  const timeSlots: TimeSlot[] = [
    { id: '1', time: '9:00 AM - 10:00 AM', available: true },
    { id: '2', time: '10:00 AM - 11:00 AM', available: true },
    { id: '3', time: '11:00 AM - 12:00 PM', available: true },
    { id: '4', time: '1:00 PM - 2:00 PM', available: true },
    { id: '5', time: '2:00 PM - 3:00 PM', available: true },
    { id: '6', time: '3:00 PM - 4:00 PM', available: true },
    { id: '7', time: '4:00 PM - 5:00 PM', available: true },
    { id: '8', time: '5:00 PM - 6:00 PM', available: true },
  ];

  useEffect(() => {
    const fetchBookingCounts = async () => {
      if (!selectedDate) return;

      const counts: Record<string, number> = {};
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('date', '==', selectedDate)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timeId = data.time;
        counts[timeId] = (counts[timeId] || 0) + 1;
      });

      setBookingCounts(counts);
    };

    fetchBookingCounts();
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    // Reset time selection when date changes
    setSelectedTime('');
  };

  const isTimeSlotAvailable = (slot: TimeSlot) => {
    if (!selectedDate) return false;

    const [startTime] = slot.time.split(' - ');
    const [hours, minutes] = startTime.split(':');
    const isPM = startTime.includes('PM');
    
    // Convert to 24-hour format
    let hour = parseInt(hours);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hour, parseInt(minutes), 0, 0);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // If selected date is today, check if the time slot is in the future
    if (selectedDate === today) {
      // Add 30 minutes buffer to current time to allow for booking
      const bufferTime = new Date(now.getTime() + 30 * 60000);
      if (selectedDateTime <= bufferTime) return false;
    }

    // Check if the slot has reached the booking limit (200)
    const currentBookings = bookingCounts[slot.id] || 0;
    if (currentBookings >= 200) return false;

    return true;
  };

  const getRemainingBookings = (slot: TimeSlot) => {
    const currentBookings = bookingCounts[slot.id] || 0;
    return 200 - currentBookings;
  };

  const isPastTimeSlot = (slot: TimeSlot) => {
    if (!selectedDate) return false;

    const [startTime] = slot.time.split(' - ');
    const [hours, minutes] = startTime.split(':');
    const isPM = startTime.includes('PM');
    
    // Convert to 24-hour format
    let hour = parseInt(hours);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hour, parseInt(minutes), 0, 0);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (selectedDate === today) {
      const bufferTime = new Date(now.getTime() + 30 * 60000);
      return selectedDateTime <= bufferTime;
    }

    return false;
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleTimeSelect = (timeId: string) => {
    setSelectedTime(timeId);
  };

  const handleBooking = async () => {
    try {
      if (!currentUser) throw new Error('User not authenticated');
      
      const reference = `ENG-${Math.floor(Math.random() * 100000)}`;
      
      // Send booking confirmation email
      await sendBookingConfirmationEmail({
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userName: currentUser.displayName || 'User',
        sessionType: selectedType,
        date: selectedDate,
        time: selectedTime,
        reference
      });

      setBooking({
        completed: true,
        reference
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      // Handle error appropriately
    }
  };

  return (
    <>
      <SEO 
        title="Book an Appointment" 
        description="Book an appointment with Engiversee for educational sessions and expert guidance."
      />
      
      <section className="section bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">Book an Appointment</h1>
            <p className="text-xl text-blue-100">
              Schedule a session with our experts to discuss your educational journey
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          {!booking.completed ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-8 text-center">Schedule Your Session</h2>
                
                {/* Step 1: Select Date */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold mb-4">1. Choose a Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Step 2: Select Session Type */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold mb-4">2. Select Session Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessionTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="mr-4">{type.icon}</div>
                          <div>
                            <h4 className="font-bold mb-1">{type.title}</h4>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Step 3: Select Time Slot */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold mb-4">3. Select Time Slot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => {
                      const isAvailable = isTimeSlotAvailable(slot);
                      const isPast = isPastTimeSlot(slot);
                      const remainingBookings = getRemainingBookings(slot);
                      return (
                        <button
                          key={slot.id}
                          onClick={() => isAvailable && handleTimeSelect(slot.id)}
                          disabled={!isAvailable}
                          className={`py-2 px-3 rounded-md text-center ${
                            !isAvailable
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selectedTime === slot.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          <div>{slot.time}</div>
                          {!isPast && (
                            <div className="text-xs text-gray-500">
                              {remainingBookings} seats available
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * Time slots are unavailable if they are in the past or if they are full
                  </p>
                </div>
                
                {/* Submit Button */}
                <div className="text-center">
                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedType || !selectedTime}
                    className={`px-8 py-3 rounded-md font-medium ${
                      selectedDate && selectedType && selectedTime
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <motion.div 
              className="max-w-2xl mx-auto text-center bg-white p-8 rounded-lg shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
              <p className="text-lg text-gray-700 mb-3">
                Your appointment has been successfully scheduled.
              </p>
              <p className="text-gray-700 mb-6">
                We've sent a confirmation email with all the details. Your booking reference is: <span className="font-bold">{booking.reference}</span>
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-8">
                <p className="text-sm text-blue-800">
                  Our team will contact you shortly to confirm your appointment and provide any additional information you might need.
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Home
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default BookingPage;