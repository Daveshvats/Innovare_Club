import React, { useEffect, useState } from 'react';
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';

// Types
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  tags?: string[];
  imageUrl?: string;
  featured: boolean;
  isActive: boolean;
  registrationType?: string;
  registrationUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface RegistrationData {
  name: string;
  email: string;
  phone?: string;
}

export default function Events() {
  const featuredRef = useScrollAnimation();
  const timelineRef = useScrollAnimation();
  
  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registerEvent, setRegisterEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: ''
  });
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const eventsData: Event[] = await response.json();
        console.log('Fetched events:', eventsData);
        console.log('First event date:', eventsData[0]?.date);
        console.log('First event date type:', typeof eventsData[0]?.date);
        
        // Filter active events and sort by date
        const activeEvents = eventsData
          .filter(event => event.isActive)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Find featured event (only one should be featured)
        const featured = activeEvents.find(event => event.featured);
        setFeaturedEvent(featured || null);
        
        // Set timeline events (non-featured events)
        const timeline = activeEvents.filter(event => !event.featured);
        setTimelineEvents(timeline);
        
        setEvents(activeEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
        
        // Fallback to sample data
        const sampleEvents: Event[] = [
          {
            id: '1',
            title: 'TechFest 2024',
            description: 'Our biggest annual event featuring cutting-edge presentations, hands-on workshops, and networking opportunities with industry leaders.',
            date: '2024-03-22T00:00:00Z',
            time: '10:00 AM - 6:00 PM',
            location: 'Innovation Center',
            maxParticipants: 500,
            currentParticipants: 150,
            tags: ['Programming', 'Tech Competition', 'Innovation'],
            imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            featured: true,
            isActive: true,
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Code-a-thon Weekend',
            description: '48-hour intensive coding challenge with amazing prizes and mentorship opportunities.',
            date: '2024-11-15T00:00:00Z',
            time: '9:00 AM - 5:00 PM',
            location: 'Computer Lab',
            maxParticipants: 50,
            currentParticipants: 25,
            tags: ['Coding', 'Competition'],
            imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            featured: false,
            isActive: true,
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setEvents(sampleEvents);
        setFeaturedEvent(sampleEvents[0]);
        setTimelineEvents(sampleEvents.slice(1));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Auto-delete old events (run on component mount)
  useEffect(() => {
    const deleteOldEvents = async () => {
      try {
        const response = await fetch('/api/events/cleanup', {
          method: 'DELETE'
        });
        if (response.ok) {
          console.log('Old events cleaned up successfully');
        }
      } catch (error) {
        console.error('Failed to cleanup old events:', error);
      }
    };

    deleteOldEvents();
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
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === registerEvent.id 
            ? { ...event, currentParticipants: event.currentParticipants + 1 }
            : event
        )
      );

      if (featuredEvent?.id === registerEvent.id) {
        setFeaturedEvent(prev => prev ? { ...prev, currentParticipants: prev.currentParticipants + 1 } : null);
      }

      setTimelineEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === registerEvent.id 
            ? { ...event, currentParticipants: event.currentParticipants + 1 }
            : event
        )
      );

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

  // Format date for display
  const formatDate = (dateString: string) => {
    console.log("Formatting date:", dateString);
    const date = new Date(dateString);
    console.log("Parsed date:", date);
    console.log("Date is valid:", !isNaN(date.getTime()));
    
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Check if registrations are open for an event
  const isRegistrationOpen = (event: Event) => {
    if (!event.isActive) return false;
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate > now; // Registration open if event is in the future
  };

  // Get event status
  const getEventStatus = (event: Event) => {
    if (!event.isActive) return { text: 'Inactive', color: 'bg-gray-500' };
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return { text: 'Full', color: 'bg-red-500' };
    }
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate <= now) {
      return { text: 'Past Event', color: 'bg-gray-500' };
    }
    return { text: 'Open', color: 'bg-green-500' };
  };

  // Get color class for tags
  const getTagColor = (index: number) => {
    const colors = ['tech-blue', 'tech-green', 'purple-500'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-tech-light via-background to-gray-50">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-tech font-bold mb-4 text-tech-dark">Loading Events...</div>
            <div className="animate-pulse text-tech-grey">Please wait while we load the events</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-br from-tech-light via-background to-gray-50">

      <section className="relative z-10 min-h-screen py-12 sm:py-16 lg:py-20 pt-24 sm:pt-28 lg:pt-32">
        <div className="responsive-container">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in" data-testid="events-header">
            <h1 className="font-tech text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-tech-dark mb-4 lg:mb-6">Events & Activities</h1>
            <p className="text-lg sm:text-xl text-tech-grey max-w-3xl mx-auto leading-relaxed">
              Discover our latest events, workshops, and technical showcases designed to push the
              boundaries of innovation.
            </p>
          </div>

          {/* Featured Event */}
          {featuredEvent && (
            <div 
              ref={featuredRef} 
              className="geometric-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-12 lg:mb-16 hover-lift animate-scale-in cursor-pointer" 
              data-testid="featured-event"
              onClick={() => setSelectedEvent(featuredEvent)}
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="h-48 sm:h-64 lg:h-80 rounded-xl overflow-hidden relative">
                    <img
                      src={featuredEvent.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                      alt={featuredEvent.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-white text-xs font-semibold rounded-full ${getEventStatus(featuredEvent).color}`}>
                        {getEventStatus(featuredEvent).text}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2 space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 sm:px-4 py-1 sm:py-2 bg-tech-blue text-white font-mono text-xs sm:text-sm rounded-full">
                      Featured Event
                    </span>
                    <span className={`px-2 py-1 text-white text-xs font-semibold rounded-full ${getEventStatus(featuredEvent).color}`}>
                      {getEventStatus(featuredEvent).text}
                    </span>
                  </div>
                  <h3 className="font-tech text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-tech-dark">{featuredEvent.title}</h3>
                  <p className="text-tech-grey text-sm sm:text-base lg:text-lg leading-relaxed">
                    {featuredEvent.description}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <span className="px-2 sm:px-3 py-1 sm:py-2 bg-tech-light text-tech-dark font-mono text-xs sm:text-sm rounded-lg">
                      {formatDate(featuredEvent.date)}
                    </span>
                    <span className="px-2 sm:px-3 py-1 sm:py-2 bg-tech-light text-tech-dark font-mono text-xs sm:text-sm rounded-lg">
                      {featuredEvent.location}
                    </span>
                    <span className="px-2 sm:px-3 py-1 sm:py-2 bg-tech-light text-tech-dark font-mono text-xs sm:text-sm rounded-lg">
                      {featuredEvent.currentParticipants}{featuredEvent.maxParticipants ? `/${featuredEvent.maxParticipants}` : ''} Attendees
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(featuredEvent);
                      }}
                      className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-tech-blue text-tech-blue font-mono font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all transform hover:-translate-y-1 hover-lift"
                    >
                      View Details
                    </button>
                    {isRegistrationOpen(featuredEvent) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (featuredEvent.registrationType === "redirect" && featuredEvent.registrationUrl) {
                            window.location.href = featuredEvent.registrationUrl;
                          } else {
                            setRegisterEvent(featuredEvent);
                          }
                        }}
                        className="px-6 sm:px-8 py-3 sm:py-4 tech-gradient text-white font-mono font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift" 
                        data-testid="learn-more-button"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline of Events */}
          {timelineEvents.length > 0 && (
            <div ref={timelineRef} className="mb-12 lg:mb-16" data-testid="events-timeline">
              <h3 className="font-tech text-2xl sm:text-3xl lg:text-4xl font-bold text-tech-dark text-center mb-8 lg:mb-12 animate-fade-in">
                Event Timeline
              </h3>

              <div className="space-y-8 lg:space-y-12">
                {/* First Row */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                  {timelineEvents.slice(0, 3).map((event, index) => (
                  <div 
                    key={event.id} 
                    className="geometric-card rounded-2xl p-4 sm:p-6 hover-lift animate-bounce-in cursor-pointer" 
                    style={{animationDelay: `${index * 0.1}s`}} 
                    data-testid={`timeline-event-${index}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="relative">
                      <img
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                        alt={event.title}
                        className="rounded-xl w-full h-36 sm:h-48 object-cover mb-3 sm:mb-4"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-white text-xs font-semibold rounded-full ${getEventStatus(event).color}`}>
                          {getEventStatus(event).text}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-block px-2 sm:px-3 py-1 bg-${getTagColor(index)} text-white font-mono text-xs sm:text-sm rounded-full mb-2`}>
                      {formatDate(event.date)}
                    </span>
                    <h4 className="font-tech text-lg sm:text-xl font-bold text-tech-dark mb-2">
                      {event.title}
                    </h4>
                    <p className="text-tech-grey text-xs sm:text-sm leading-relaxed mb-3">{event.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-tech-grey">
                        {event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''} registered
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="px-2 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          View
                        </button>
                        {isRegistrationOpen(event) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (event.registrationType === "redirect" && event.registrationUrl) {
                                window.location.href = event.registrationUrl;
                              } else {
                                setRegisterEvent(event);
                              }
                            }}
                            className="px-2 py-1 bg-tech-blue text-white text-xs rounded-lg hover:bg-tech-green transition-colors"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>

                {/* Second Row */}
                {timelineEvents.length > 3 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {timelineEvents.slice(3, 6).map((event, index) => (
                      <div 
                        key={event.id} 
                        className="geometric-card rounded-2xl p-4 sm:p-6 hover-lift animate-bounce-in cursor-pointer" 
                        style={{animationDelay: `${(index + 3) * 0.1}s`}} 
                        data-testid={`timeline-event-${index + 3}`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="relative">
                          <img
                            src={event.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                            alt={event.title}
                            className="rounded-xl w-full h-36 sm:h-48 object-cover mb-3 sm:mb-4"
                            loading="lazy"
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-white text-xs font-semibold rounded-full ${getEventStatus(event).color}`}>
                              {getEventStatus(event).text}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-block px-2 sm:px-3 py-1 bg-${getTagColor(index + 3)} text-white font-mono text-xs sm:text-sm rounded-full mb-2`}>
                          {formatDate(event.date)}
                        </span>
                        <h4 className="font-tech text-lg sm:text-xl font-bold text-tech-dark mb-2">
                          {event.title}
                        </h4>
                        <p className="text-tech-grey text-xs sm:text-sm leading-relaxed mb-3">{event.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-tech-grey">
                            {event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''} registered
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className="px-2 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              View
                            </button>
                            {isRegistrationOpen(event) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (event.registrationType === "redirect" && event.registrationUrl) {
                                    window.location.href = event.registrationUrl;
                                  } else {
                                    setRegisterEvent(event);
                                  }
                                }}
                                className="px-2 py-1 bg-tech-blue text-white text-xs rounded-lg hover:bg-tech-green transition-colors"
                              >
                                Register
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No events message */}
          {events.length === 0 && !loading && (
            <div className="text-center py-20">
              <h3 className="font-tech text-2xl font-bold text-tech-dark mb-4">No Events Available</h3>
              <p className="text-tech-grey">Check back later for exciting events!</p>
            </div>
          )}
        </div>
      </section>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-3xl font-tech font-bold text-gray-900 dark:text-white">
                      {selectedEvent.title}
                    </h2>
                    <span className={`px-3 py-1 text-white text-sm font-semibold rounded-full ${getEventStatus(selectedEvent).color}`}>
                      {getEventStatus(selectedEvent).text}
                    </span>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    {selectedEvent.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={selectedEvent.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                    alt={selectedEvent.title}
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-tech-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDate(selectedEvent.date)}
                        {selectedEvent.time && ` • ${selectedEvent.time}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-tech-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-tech-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {selectedEvent.currentParticipants}{selectedEvent.maxParticipants ? `/${selectedEvent.maxParticipants}` : ''} participants
                      </span>
                    </div>
                  </div>

                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className={`px-3 py-1 text-white text-sm rounded-full ${
                              index % 3 === 0 ? 'bg-tech-blue' : 
                              index % 3 === 1 ? 'bg-tech-green' : 'bg-purple-500'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    {isRegistrationOpen(selectedEvent) ? (
                      <button
                        onClick={() => {
                          setSelectedEvent(null);
                          if (selectedEvent.registrationType === "redirect" && selectedEvent.registrationUrl) {
                            window.location.href = selectedEvent.registrationUrl;
                          } else {
                            setRegisterEvent(selectedEvent);
                          }
                        }}
                        className="w-full px-6 py-3 tech-gradient text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1"
                      >
                        Register Now
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                          {!selectedEvent.isActive ? 'This event is currently inactive.' :
                           selectedEvent.maxParticipants && selectedEvent.currentParticipants >= selectedEvent.maxParticipants ? 'This event is full.' :
                           'Registration is closed for this event.'}
                        </p>
                        <button
                          disabled
                          className="w-full px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-tech font-semibold rounded-xl cursor-not-allowed"
                        >
                          Registration Closed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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