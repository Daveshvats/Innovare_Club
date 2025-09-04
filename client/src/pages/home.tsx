import { SplineViewer } from "@/components/spline-viewer";
import { CountdownTimer } from "@/components/countdown-timer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { HomeRobot } from "@/components/home-robot";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
interface FeaturedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  tags?: string[];
  imageUrl?: string;
  maxParticipants?: number;
  currentParticipants: number;
  featured: boolean;
  isActive: boolean;
  registrationType?: string;
  registrationUrl?: string;
}

interface RegistrationData {
  name: string;
  email: string;
  phone?: string;
}

export default function Home() {
  const heroRef = useScrollAnimation();
  const eventRef = useScrollAnimation();
  const [featuredEvent, setFeaturedEvent] = useState<FeaturedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [registerEvent, setRegisterEvent] = useState<FeaturedEvent | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: ''
  });
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Fetch featured event from database
  useEffect(() => {
    const fetchFeaturedEvent = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const events = await response.json();
          const featured = events.find((event: any) => event.featured && event.isActive);
          setFeaturedEvent(featured || null);
        }
      } catch (error) {
        console.error('Failed to fetch featured event:', error);
        // Fallback to default event
        setFeaturedEvent({
          id: '1',
          title: 'TechFest 2025',
          description: 'Join the ultimate showcase of innovation and technology where students compete in exciting technical challenges and showcase their skills.',
          date: '2025-10-03T10:00:00',
          time: '10:00 AM - 6:00 PM',
          location: 'Innovation Center',
          tags: ['Programming', 'Tech Competition', 'Innovation'],
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
          maxParticipants: 500,
          currentParticipants: 150,
          featured: true,
          isActive: true,
          registrationType: 'dialog'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvent();
  }, []);

  // Handle registration
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEvent) return;

    // Check if event is full
    if (registerEvent.maxParticipants && 
        registerEvent.currentParticipants >= registerEvent.maxParticipants) {
      alert('Sorry, this event is full!');
      return;
    }

    setRegistrationLoading(true);
    try {
      const response = await fetch(`/api/events/${registerEvent.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // Update local state
      setFeaturedEvent(prev => prev ? { ...prev, currentParticipants: prev.currentParticipants + 1 } : null);

      setRegisterEvent(null);
      setRegistrationData({ name: '', email: '', phone: '' });
      alert('Registration successful! We will contact you soon.');
    } catch (error) {
      console.error('Registration error:', error);
      alert(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Check if registrations are open for an event
  const isRegistrationOpen = (event: FeaturedEvent) => {
    if (!event.isActive) return false;
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate > now; // Registration open if event is in the future
  };

  return (
    <div className="min-h-screen scroll-smooth">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen pt-16 bg-gradient-to-br from-tech-light via-background to-gray-50"
        data-testid="hero-section"
      >
        <div className="responsive-container py-12 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1 space-y-6 lg:space-y-8">
              <h1 className="font-tech text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-tech-dark leading-tight animate-slide-left">
                Welcome to<br />
                <span className="tech-gradient bg-clip-text text-transparent">Innovare</span>
                <br />
                Technical Club
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-tech-grey max-w-2xl mx-auto lg:mx-0 animate-slide-left" style={{animationDelay: '0.2s'}} data-testid="hero-description">
                Empowering the next generation of tech innovators through cutting-edge projects,
                collaborative learning, and breakthrough solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-bounce-in" style={{animationDelay: '0.4s'}}>
                <button
                  onClick={() => window.location.href = '/community'}
                  className="px-6 sm:px-8 py-3 sm:py-4 tech-gradient text-white font-mono font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift"
                  data-testid="join-community-button"
                >
                  Join Our Community
                </button>
                <button
                  onClick={() => window.location.href = '/techfest'}
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-tech-blue text-tech-blue font-mono font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all hover-lift"
                  data-testid="explore-projects-button"
                >
                  Explore TechFest
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 animate-float" data-testid="hero-spline">
             <HomeRobot className="w-16 h-16 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Upcoming Event Section */}
        <div
          ref={eventRef}
          className="responsive-container py-12 sm:py-16 lg:py-20"
          data-testid="upcoming-event-section"
        >
          <div className="text-center mb-12 lg:mb-16 animate-fade-in">
            <h2 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold text-tech-dark mb-4 lg:mb-6">Upcoming Event</h2>
            <p className="text-lg sm:text-xl text-tech-grey">Don't miss our next innovation showcase</p>
          </div>

          {loading ? (
            <div className="geometric-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto hover-lift animate-scale-in">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-xl font-tech font-bold mb-4 text-tech-dark">Loading Featured Event...</div>
                  <div className="animate-pulse text-tech-grey">Please wait</div>
                </div>
              </div>
            </div>
          ) : featuredEvent ? (
            <div className="geometric-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto hover-lift animate-scale-in">
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="font-tech text-2xl sm:text-3xl lg:text-4xl font-bold text-tech-dark" data-testid="event-title">
                    {featuredEvent.title}
                  </h3>
                  <p className="text-tech-grey text-sm sm:text-base lg:text-lg leading-relaxed" data-testid="event-description">
                    {featuredEvent.description}
                  </p>
                  {featuredEvent.tags && featuredEvent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {featuredEvent.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className={`px-3 py-1 text-white text-xs sm:text-sm rounded-full font-mono ${
                            index % 3 === 0 ? 'bg-tech-blue' : 
                            index % 3 === 1 ? 'bg-tech-green' : 'bg-purple-500'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center text-tech-grey text-sm sm:text-base" data-testid="event-details">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="font-mono">
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {featuredEvent.time && ` | ${featuredEvent.time}`}
                    </span>
                  </div>
                  <div className="flex items-center text-tech-grey text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="font-mono">{featuredEvent.location}</span>
                  </div>
                  
                  {/* Registration Button */}
                  {isRegistrationOpen(featuredEvent) && (
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          if (featuredEvent.registrationType === "redirect" && featuredEvent.registrationUrl) {
                            window.location.href = featuredEvent.registrationUrl;
                          } else {
                            setRegisterEvent(featuredEvent);
                          }
                        }}
                        className="px-6 sm:px-8 py-3 sm:py-4 tech-gradient text-white font-mono font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift"
                        data-testid="register-button"
                      >
                        Register Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Countdown Timer */}
                <div className="w-full">
                  <CountdownTimer targetDate={featuredEvent.date} className="w-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="geometric-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto hover-lift animate-scale-in">
              <div className="text-center">
                <h3 className="font-tech text-2xl font-bold text-tech-dark mb-4">No Featured Event</h3>
                <p className="text-tech-grey">Check back later for exciting events!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {registerEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setRegisterEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg mx-4 rounded-2xl backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-tech font-bold text-gray-900 dark:text-white mb-4">
                Register for {registerEvent.title}
              </h2>
              
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setRegisterEvent(null)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registrationLoading}
                    className="flex-1 rounded-lg tech-gradient px-4 py-3 font-tech font-semibold text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {registrationLoading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
