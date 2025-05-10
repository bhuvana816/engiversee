import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, GraduationCap, Award, Lightbulb, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/common/SEO';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    if (currentUser) {
      navigate('/booking');
    } else {
      navigate('/login', { state: { from: '/booking' } });
    }
  };

  const domains = [
    { title: 'Web Development', icon: <BookOpen className="w-12 h-12 text-blue-600" /> },
    { title: 'App Development', icon: <GraduationCap className="w-12 h-12 text-teal-600" /> },
    { title: 'Data Science', icon: <Lightbulb className="w-12 h-12 text-orange-600" /> },
    { title: 'AI & ML', icon: <Award className="w-12 h-12 text-purple-600" /> }
  ];

  const testimonials = [
    
    {
      id: 1,
      name: "Preethi",
      course: "Web Development",
      videoUrl: "/videos/VID-20250426-WA0002.mp4",
      thumbnail: "/videos/VID-20250426-WA0002.mp4",
      quote: "Their sessions provided valuable resources and insightful webinars that greatly enhanced my learning experience and broadened my understanding of the subject."
    },
    {
      id: 2,
      name: "Padma Sree", 
      course: "Technical Skills",
      videoUrl: "/videos/VID-20250426-WA0003.mp4",
      thumbnail: "/videos/VID-20250426-WA0003.mp4",
      quote: "The sessions greatly strengthened my aptitude skills and provided additional resources that helped me improve my overall problem-solving abilities."
    },
    
    {
      id: 3,
      name: "Dipansh Choudhary",
      course: "Competitative Coding", 
      videoUrl: "/videos/VID-20250426-WA0005.mp4",
      thumbnail: "/videos/VID-20250426-WA0005.mp4",
      quote: "The coding classes led by Mr. Ragavendra were extremely valuable, with well-organized sessions and hands-on exercises that simplified complex programming topics."
    },
    {
      id: 4,
      name: "Prajin",
      course: "CP",
      videoUrl: "/videos/WhatsApp Video 2025-04-26 at 12.19.02_0908540c.mp4",
      thumbnail: "/videos/WhatsApp Video 2025-04-26 at 12.19.02_0908540c.mp4",
      quote: "Attending the coding classes conducted by Mr. Ragavendra was an enriching experience. The sessions were well-structured, and the hands-on exercises made complex programming concepts easy to graspded my expectations. The curriculum was comprehensive and the practical assignments helped me understand complex concepts easily."
    },
    /*
     {
      id: 5,
      name: "",
      course: "Technical Skills",
      videoUrl: "/videos/VID-20250426-WA0004.mp4",
      thumbnail: "/videos/VID-20250426-WA0004.mp4",
      quote: "The AI course exceeded my expectations. The curriculum was comprehensive and the practical assignments helped me understand complex concepts easily."
    },
    */
  ];

  return (
    <>
      <SEO 
        title="Engiversee - Empowering Engineering Students with Practical Skills"
        description="Join Engiversee to bridge the gap between academic theory and industry practice. Free workshops, programming tutorials, and career guidance for engineering students."
        keywords="engineering education, programming tutorials, technical workshops, career guidance, student development, practical skills, web development, data science, AI ML"
      />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 md:py-32">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Empowering Engineers of Tomorrow
              </motion.h1>
              <motion.p 
                className="text-xl mb-8 text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Embark on a journey of knowledge and growth with Engiversee. We bridge the gap between theoretical education and practical industry skills.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <button 
                  onClick={handleBookAppointment} 
                  className="btn btn-primary bg-white text-blue-700 hover:bg-blue-50"
                  aria-label="Book an appointment for personalized guidance"
                >
                  Book an Appointment
                </button>
                <Link 
                  to="/about" 
                  className="btn btn-outline border-white text-white hover:bg-white/10"
                  aria-label="Learn more about Engiversee's mission and vision"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section bg-gray-50" aria-labelledby="features-heading">
          <div className="container">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="mb-4">What We Offer</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our community focuses on offering a variety of educational resources and opportunities to help you excel in your journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div className="card p-8" whileHover={{ y: -10, transition: { duration: 0.3 } }}>
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-4">Free Workshops</h3>
                <p className="text-gray-600">
                  Participate in our hands-on workshops designed to enhance your technical skills across various domains.
                </p>
              </motion.div>

              <motion.div className="card p-8" whileHover={{ y: -10, transition: { duration: 0.3 } }}>
                <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-4">Community Support</h3>
                <p className="text-gray-600">
                  Join a thriving community of like-minded individuals who share knowledge and support each other's growth.
                </p>
              </motion.div>

              <motion.div className="card p-8" whileHover={{ y: -10, transition: { duration: 0.3 } }}>
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-orange-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-4">Industry Events</h3>
                <p className="text-gray-600">
                  Connect with industry experts through webinars, seminars, and networking events tailored for engineers.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Domains Section */}
        <section className="section" aria-labelledby="domains-heading">
          <div className="container">
            <div className="text-center mb-16">
              <h2 id="domains-heading" className="mb-4">Explore Our Domains</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover educational resources across various technical domains
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {domains.map((domain, index) => (
                <motion.div 
                  key={index}
                  className="card p-6 text-center"
                  whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                >
                  <div className="flex justify-center mb-4">
                    {domain.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{domain.title}</h3>
                  <Link 
                    to="/search" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    aria-label={`View ${domain.title} sessions`}
                  >
                    View Sessions →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Testimonials Section */}
        <section className="section bg-gray-50" aria-labelledby="testimonials-heading">
          <div className="container">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="mb-4">Student Success Stories</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from our students about their learning journey with Engiversee
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <video 
                      src={testimonial.thumbnail} 
                      className="w-full h-48 object-cover" 
                      muted 
                      loop 
                      playsInline 
                      autoPlay 
                      aria-label={`Video testimonial from ${testimonial.name}`}
                    />
                    <a 
                      href={testimonial.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity hover:bg-opacity-40"
                      aria-label={`Watch ${testimonial.name}'s full testimonial`}
                    >
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-600 ml-1" aria-hidden="true" />
                      </div>
                    </a>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{testimonial.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{testimonial.course}</p>
                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Web Development Team Section */}
        <section className="section bg-gradient-to-b from-gray-50 to-white" aria-labelledby="web-dev-team-heading">
          <div className="container">
            <div className="text-center mb-16">
              <h2 id="web-dev-team-heading" className="text-3xl md:text-4xl font-bold mb-4 text-blue-900">Meet Our Development Lead</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Leading the charge in creating innovative educational experiences
              </p>
            </div>

            <div className="flex justify-center">
              <motion.div 
                className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full transform transition-all duration-300 hover:shadow-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <img 
                    src="/images/vivek.jpg" 
                    alt="Vivek Deshmukh" 
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">Vivek Deshmukh</h3>
                    <p className="text-blue-200 font-medium">Head of Development Team</p>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Leading our web development initiatives with a passion for creating engaging and interactive learning experiences. With expertise in modern web technologies and a focus on user-centered design.
                  </p>
                  <div className="flex justify-center space-x-6 mb-6">
                    <a 
                      href="https://github.com/vivekdeshmukh1718" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors transform hover:scale-110"
                      aria-label="Vivek's GitHub"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a 
                      href="http://www.linkedin.com/in/vivekdeshmukhsoftwaredeveloper" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors transform hover:scale-110"
                      aria-label="Vivek's LinkedIn"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a 
                      href="mailto:vivek@engiversee.com"
                      className="text-gray-600 hover:text-blue-600 transition-colors transform hover:scale-110"
                      aria-label="Email Vivek"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M0 3v18h24V3H0zm21.518 2L12 12.713 2.482 5H21.518zM2 19V7.183l10 8.104 10-8.104V19H2z" />
                      </svg>
                    </a>
                  </div>
                  <div className="text-center">
                    <a 
                      href="tel:+919156569060"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM21 6h-3V3h-2v3h-3v2h3v3h2V8h3z"/>
                      </svg>
                      <span className="font-medium">+91 9156569060</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Begin Your Journey?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join Engiversee today and take the first step towards enhancing your skills and advancing your career.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleBookAppointment}
                className="btn bg-white text-blue-800 hover:bg-blue-50"
                aria-label="Book an appointment to start your learning journey"
              >
                Book an Appointment
              </button>
              <Link 
                to="/signup" 
                className="btn border border-white text-white hover:bg-white/10"
                aria-label="Create your Engiversee account"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;