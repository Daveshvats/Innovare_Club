// src/pages/techfest.tsx

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import * as Spline from '@splinetool/viewer';
import { HomeRobot } from '@/components/home-robot';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// Dynamic component loader for generated Spline components
const DynamicSplineComponent: React.FC<{ 
  eventName: string; 
  className?: string; 
  fallbackUrl?: string;
}> = ({ eventName, className = "", fallbackUrl }) => {
  const [SplineComponent, setSplineComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        // Convert event name to component name (same logic as component generator)
        const componentName = eventName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Try to dynamically import the generated component
        const componentModule = await import(`@/components/generated/${componentName}.tsx`);
        
        // The component is exported with PascalCase (each word capitalized, no spaces)
        const exportName = eventName
          .split(/[^a-zA-Z0-9]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        const ComponentClass = componentModule[exportName];
        
        if (ComponentClass) {
          setSplineComponent(() => ComponentClass);
        }
      } catch (error) {
        console.log(`No generated component found for ${eventName}, using fallback`);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [eventName]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-muted-foreground">Loading 3D scene...</div>
      </div>
    );
  }

  if (SplineComponent) {
    return <SplineComponent className={className} />;
  }

  // Fallback to iframe if component not found
  if (fallbackUrl) {
    return (
      <div className={`w-full h-full ${className}`}>
        <iframe 
          src={fallbackUrl}
          className="w-full h-full border-0 rounded-xl"
          style={{ 
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '0.75rem'
          }}
          title="3D Background"
          loading="lazy"
        />
      </div>
    );
  }

  return null;
};

const TechFestBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let Application: any;
    let app: any;

    async function init() {
      if (!canvasRef.current) return;

      try {
        // Dynamically import the Spline runtime ES module from CDN
        // @ts-ignore - Dynamic import from CDN
        const module = await import('https://unpkg.com/@splinetool/runtime@1.10.51/build/runtime.js');
        Application = module.Application;

        // Initialize the 3D app on the canvas
        app = new Application(canvasRef.current);

        // Load the specific Spline scene
        await app.load('https://prod.spline.design/DC0L-NagpocfiwmY/scene.splinecode');

        appRef.current = app;
      } catch (error) {
        console.error('Failed to load TechFest background scene:', error);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy();
        } catch (error) {
          console.error('Error destroying TechFest background app:', error);
        }
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden ${className}`} style={{ zIndex: -1 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block outline-none"
        style={{
          background: 'transparent',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

// Event spline component removed - using DynamicSplineComponent directly

type EventItem = {
  id: string;
  slug?: string;
  name: string;
  number?: number;
  category: string;
  short_description: string;
  description: string;
  rules: string[];
  youtube_url?: string;
  team_min: number;
  team_max: number;
  spline_right_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

type RegistrationPayload = {
  technofestId: string;
  teamName: string;
  members: { name: string; email?: string }[];
  contactEmail: string;
};

type Category = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
};

const categories: Category[] = [
  {
    id: 'Cultural',
    name: 'Cultural Events',
    description: 'Art, music, dance and creative competitions',
    color: 'purple',
    icon: '🎭'
  },
  {
    id: 'Sports', 
    name: 'Sports Events',
    description: 'Athletic competitions and physical challenges',
    color: 'green',
    icon: '⚽'
  },
  {
    id: 'Technical',
    name: 'Technical Events', 
    description: 'Programming, robotics and technical challenges',
    color: 'blue',
    icon: '💻'
  }
];

export default function Techfest() {
  const heroRef = useScrollAnimation();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [learnMoreEvent, setLearnMoreEvent] = useState<EventItem | null>(null);
  const [registerEvent, setRegisterEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Registration state
  const [teamName, setTeamName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [members, setMembers] = useState<{ name: string; email?: string }[]>([]);

  // Fetch events
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/technofest');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data: EventItem[] = await res.json();
        setEvents(data);
        setError(null);
      } catch (e) {
        console.error('Failed to load technofest events:', e);
        setError(e instanceof Error ? e.message : 'Failed to load events');
        
        // Sample events as fallback (using proper database categories)
        const sampleEvents: EventItem[] = [
          {
            id: '1',
            slug: 'art-showcase',
            name: 'Digital Art Showcase',
            number: 1,
            category: 'Cultural',
            short_description: 'Express your creativity through digital art and design',
            description: 'Create stunning digital artwork using modern tools and showcase your artistic vision.',
            rules: ['Individual participation', 'Original artwork only', 'Submit in high resolution'],
            team_min: 1,
            team_max: 1,
            spline_right_url: "https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode",
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '2',
            slug: 'coding-contest',
            name: 'Algorithm Master',
            number: 2,
            category: 'Technical',
            short_description: 'Solve complex algorithmic challenges and optimize your code',
            description: 'Test your programming skills with challenging algorithmic problems.',
            rules: ['Individual or team of 2', 'Any programming language', '3 hour time limit'],
            team_min: 1,
            team_max: 2,
            spline_right_url: "https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode",
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '3',
            slug: 'esports-tournament',
            name: 'E-Sports Championship',
            number: 3,
            category: 'Sports',
            short_description: 'Compete in the ultimate gaming tournament',
            description: 'Battle it out in popular games and showcase your gaming skills.',
            rules: ['Team of 5 players', 'Bring your own devices', 'Fair play required'],
            team_min: 5,
            team_max: 5,
            spline_right_url: "https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode",
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          }
        ];
        setEvents(sampleEvents);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter events based on selected category (using database category field)
  useEffect(() => {
    if (selectedCategory) {
      const filtered = events.filter(event => 
        event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [selectedCategory, events]);

  // Handle scroll-based event switching with intersection observer and auto-scroll
  useEffect(() => {
    if (filteredEvents.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.6
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-event-index') || '0');
          if (index !== currentEventIndex) {
            setCurrentEventIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all event sections
    const eventSections = document.querySelectorAll('[data-event-index]');
    eventSections.forEach(section => observer.observe(section));

    return () => {
      eventSections.forEach(section => observer.unobserve(section));
      observer.disconnect();
    };
  }, [filteredEvents.length, currentEventIndex]);

  // Auto-scroll between events
  useEffect(() => {
    if (filteredEvents.length <= 1) return;

    const autoScrollInterval = setInterval(() => {
      const nextIndex = (currentEventIndex + 1) % filteredEvents.length;
      const nextEventElement = document.querySelector(`[data-event-index="${nextIndex}"]`);
      
      if (nextEventElement) {
        nextEventElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 10000); // Auto-scroll every 10 seconds

    return () => clearInterval(autoScrollInterval);
  }, [currentEventIndex, filteredEvents.length]);

  // Registration handlers
  useEffect(() => {
    if (!registerEvent) return;
    setMembers((cur) => {
      const want = Math.max(registerEvent.team_min || 1, 1);
      if (cur.length >= want) return cur;
      const add = Array.from({ length: want - cur.length }, () => ({ name: '' }));
      return [...cur, ...add];
    });
  }, [registerEvent?.id]);

  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEvent) return;

    const filled = members.filter((m) => m.name.trim().length > 0);
    if (
      filled.length < registerEvent.team_min ||
      filled.length > registerEvent.team_max
    ) {
      alert(
        `Please provide between ${registerEvent.team_min} and ${registerEvent.team_max} team members.`
      );
      return;
    }

    if (!contactEmail || !teamName.trim()) {
      alert('Please provide both team name and contact email.');
      return;
    }

    const payload: RegistrationPayload = {
      technofestId: registerEvent.id,
      teamName: teamName.trim(),
      members: filled,
      contactEmail: contactEmail.trim(),
    };

    try {
      const res = await fetch(`/api/technofest/${registerEvent.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed registration');
      }

      setRegisterEvent(null);
      setTeamName('');
      setContactEmail('');
      setMembers([]);
      alert('Registration received! We will email you soon.');
    } catch (err) {
      console.error('Registration error:', err);
      alert(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryDialog(false);
    setCurrentEventIndex(0);
    
    // Scroll to events section after category selection
    setTimeout(() => {
      const eventsSection = document.getElementById('events-section');
      if (eventsSection) {
        eventsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setFilteredEvents([]);
    setCurrentEventIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-tech-light via-background to-gray-50">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-tech font-bold mb-4 text-tech-dark">Loading TechFest...</div>
            <div className="animate-pulse text-tech-grey">Please wait while we load the events</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 scroll-smooth">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen bg-gradient-to-br from-tech-light via-background to-gray-50 relative overflow-hidden"
        data-testid="techfest-hero-section"
      >
        {/* Background Spline */}
        <div className="absolute inset-0 z-0">
          <TechFestBackground />
        </div>
        <div className="responsive-container py-12 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center px-4 sm:px-6">
            <div className="text-center lg:text-left order-2 lg:order-1 space-y-6 lg:space-y-8">
              <div className="text-sm font-tech font-bold uppercase tracking-widest text-tech-blue mb-4 animate-slide-left">
                Innovare presents
              </div>
              <h1 className="font-tech text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-tech-dark leading-tight animate-slide-left">
                <span className="tech-gradient bg-clip-text text-transparent">TECHFEST</span>
                <br />2024
              </h1>
              <p className="text-lg sm:text-xl text-tech-grey max-w-2xl mx-auto lg:mx-0 animate-slide-left" style={{animationDelay: '0.2s'}}>
                Showcase your skills, compete with the best, and push the boundaries of innovation across multiple disciplines.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-bounce-in" style={{animationDelay: '0.4s'}}>
                {!selectedCategory ? (
                  <button
                    onClick={() => setShowCategoryDialog(true)}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 tech-gradient text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift text-base sm:text-lg"
                    data-testid="button-browse-events"
                  >
                    Browse Events
                  </button>
                ) : (
                  <button
                    onClick={handleBackToCategories}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-tech-blue text-tech-blue font-tech font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all hover-lift text-base sm:text-lg"
                    data-testid="button-back-to-categories"
                  >
                    Back to Categories
                  </button>
                )}
                <button
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-tech-blue text-tech-blue font-tech font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all hover-lift text-base sm:text-lg"
                  data-testid="button-learn-more"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 animate-float animate-slide-right">
              <HomeRobot className="w-full h-full max-w-lg mx-auto" />
            </div>
          </div>
        </div>

        {error && (
          <div className="responsive-container">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded geometric-card max-w-md mx-auto">
              API Error: {error}. Using sample data.
            </div>
          </div>
        )}
      </section>

      {/* Events Display Section */}
      {selectedCategory && filteredEvents.length > 0 && (
        <section id="events-section" className="min-h-screen" style={{ scrollBehavior: 'smooth' }}>
          {/* Category Header */}
          <div className="bg-gradient-to-br from-tech-light via-background to-gray-50 py-4">
            <div className="responsive-container">
              <div className="text-center mb-4">
                <h2 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold text-tech-dark mb-4">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-lg sm:text-xl text-tech-grey">
                  {categories.find(c => c.id === selectedCategory)?.description}
                </p>
                <div className="mt-6 text-sm font-tech text-tech-blue">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} available
                </div>
              </div>
            </div>
          </div>

          {/* Events Container */}
          <div className="relative">
            {/* Background remains the pink gradient TechFest background only */}

            {/* Back Button */}
            {selectedCategory && filteredEvents.length > 0 && (
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-1">
                <button
                  onClick={handleBackToCategories}
                  className="inline-flex items-center gap-2 px-4 py-2 text-tech-blue hover:text-tech-dark transition-colors font-tech font-medium"
                  data-testid="button-back-to-categories-top"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Categories
                </button>
              </div>
            )}

            {/* Event Pages */}
            <div className="snap-y snap-mandatory">
              {filteredEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  data-event-index={idx}
                  className="min-h-screen snap-start bg-transparent"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 min-h-screen flex items-center relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-center w-full">
                      {/* Event Content */}
                      <motion.div 
                        className="space-y-3 md:space-y-4 order-2 lg:order-1 lg:col-span-3"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        <div className="text-xs md:text-sm font-tech font-bold uppercase tracking-widest text-tech-blue text-center lg:text-left">
                          Event #{event.number || idx + 1}
                        </div>
                        <h3 className="font-tech text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-tech-dark leading-tight text-center lg:text-left">
                          {event.name}
                        </h3>
                        <p className="text-sm md:text-base lg:text-lg text-tech-grey leading-relaxed text-center lg:text-left">
                          {event.short_description}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                          <span className="px-2 md:px-3 py-1 bg-tech-blue text-white text-xs md:text-sm rounded-full font-mono">
                            {event.category}
                          </span>
                          <span className="px-2 md:px-3 py-1 bg-tech-green text-white text-xs md:text-sm rounded-full font-mono">
                            Team: {event.team_min}–{event.team_max}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-1 md:pt-2 justify-center lg:justify-start">
                          <button
                            onClick={() => setRegisterEvent(event)}
                            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 tech-gradient text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift text-sm md:text-base"
                            data-testid={`button-register-${event.id}`}
                          >
                            Register Now
                          </button>
                          <button
                            onClick={() => setLearnMoreEvent(event)}
                            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-tech-blue text-tech-blue font-tech font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all hover-lift text-sm md:text-base"
                            data-testid={`button-learn-more-${event.id}`}
                          >
                            Learn More
                          </button>
                        </div>
                      </motion.div>

                      {/* Event Visual */}
                      <motion.div 
                        className="bg-transparent border-0 p-2 md:p-3 rounded-2xl order-1 lg:order-2 lg:col-span-2 relative z-20 flex items-center justify-center"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        {event.spline_right_url ? (
                          <div className="aspect-square spline-container rounded-xl overflow-hidden bg-transparent relative flex items-center justify-center">
                            <DynamicSplineComponent
                              eventName={event.name}
                              fallbackUrl={event.spline_right_url}
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-tech-blue/30 to-tech-green/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <div className="text-center text-white">
                              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-tech font-bold mb-1 md:mb-2">#{event.number || idx + 1}</div>
                              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-tech uppercase tracking-wider">{event.category}</div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Scroll indicator */}
                    {idx < filteredEvents.length - 1 && (
                      <div className="flex justify-center mt-8">
                        <div className="animate-bounce text-white/60">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No events message */}
      {selectedCategory && filteredEvents.length === 0 && (
        <section className="py-20 bg-gradient-to-br from-tech-light via-background to-gray-50">
          <div className="responsive-container text-center">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl p-12 rounded-2xl max-w-2xl mx-auto">
              <h3 className="font-tech text-2xl font-bold text-tech-dark mb-4">
                No {categories.find(c => c.id === selectedCategory)?.name} Available
              </h3>
              <p className="text-tech-grey mb-6">
                Check back later for exciting {selectedCategory.toLowerCase()} competitions!
              </p>
              <button
                onClick={handleBackToCategories}
                className="px-8 py-4 tech-gradient text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all hover-lift"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Category Selection Dialog */}
      <AnimatePresence>
        {showCategoryDialog && !selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCategoryDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-2xl p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-4 shadow-2xl border border-border"
            >
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="font-tech text-xl sm:text-2xl md:text-3xl font-bold text-tech-dark mb-4">
                  Choose Your Category
                </h3>
                <p className="text-tech-grey">
                  Select a category to explore available events
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-xl hover:shadow-2xl p-4 sm:p-6 rounded-xl transition-all hover-lift text-left group"
                    data-testid={`category-${category.id}`}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <h4 className="font-tech text-lg sm:text-xl font-bold text-tech-dark mb-2 group-hover:text-tech-blue transition-colors">
                      {category.name}
                    </h4>
                    <p className="text-tech-grey text-sm leading-relaxed">
                      {category.description}
                    </p>
                    <div className="mt-4 text-xs font-tech uppercase tracking-wider text-tech-blue opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore →
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setShowCategoryDialog(false)}
                  className="px-6 py-2 text-tech-grey hover:text-tech-dark font-tech transition-colors"
                  data-testid="button-close-dialog"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {learnMoreEvent && (
          <Modal onClose={() => setLearnMoreEvent(null)}>
            <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-8 shadow-2xl border border-border">
              <h2 className="mb-4 text-3xl font-tech font-bold text-tech-dark">{learnMoreEvent.name}</h2>

              {learnMoreEvent.youtube_url && (
                <div className="mb-6">
                  <iframe
                    width="100%"
                    height="315"
                    src={toEmbedUrl(learnMoreEvent.youtube_url)}
                    frameBorder="0"
                    allowFullScreen
                    className="rounded-lg"
                    title={`Video for ${learnMoreEvent.name}`}
                  />
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-xl font-tech font-semibold text-tech-blue">Description</h3>
                <p className="text-tech-grey">{learnMoreEvent.description}</p>
              </div>

              {learnMoreEvent.rules?.length ? (
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-tech font-semibold text-tech-blue">Rules & Guidelines</h3>
                  <ul className="list-disc space-y-2 pl-5 text-tech-grey">
                    {learnMoreEvent.rules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg p-3 rounded-lg">
                  <strong className="text-tech-blue">Category:</strong> {learnMoreEvent.category}
                </div>
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg p-3 rounded-lg">
                  <strong className="text-tech-blue">Team size:</strong> {learnMoreEvent.team_min}–{learnMoreEvent.team_max}
                </div>
              </div>

              <button
                onClick={() => setLearnMoreEvent(null)}
                className="w-full tech-gradient text-white py-3 rounded-lg font-tech font-semibold hover:shadow-lg transition-all"
                data-testid="button-close-modal"
              >
                Close
              </button>
            </div>
          </Modal>
        )}

        {registerEvent && (
          <Modal onClose={() => setRegisterEvent(null)}>
            <form
              onSubmit={submitRegistration}
              className="w-full max-w-lg mx-4 sm:mx-auto rounded-2xl backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-xl p-4 sm:p-6 md:p-8"
            >
              <h2 className="mb-4 text-lg sm:text-xl md:text-2xl font-tech font-bold text-gray-900 dark:text-white">{`Register: ${registerEvent.name}`}</h2>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Team size: {registerEvent.team_min}–{registerEvent.team_max}
              </div>

              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="mb-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                required
                data-testid="input-team-name"
              />

              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Contact email"
                className="mb-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                required
                data-testid="input-contact-email"
              />

              {/* Dynamic members */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-tech font-semibold text-tech-blue dark:text-tech-green">Team Members</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMembers((m) =>
                          m.length < (registerEvent.team_max || 20)
                            ? [...m, { name: '' }]
                            : m
                        )
                      }
                      className="rounded-md bg-tech-blue hover:bg-tech-green px-2 py-1 text-xs text-white transition-colors"
                      data-testid="button-add-member"
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMembers((m) =>
                          m.length > registerEvent.team_min ? m.slice(0, -1) : m
                        )
                      }
                      className="rounded-md bg-red-500 hover:bg-red-600 px-2 py-1 text-xs text-white transition-colors"
                      data-testid="button-remove-member"
                    >
                      − Remove
                    </button>
                  </div>
                </div>

                {members.map((mem, idx) => (
                  <div key={idx} className="mb-3 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={mem.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMembers((s) =>
                          s.map((m, i) => (i === idx ? { ...m, name: v } : m))
                        );
                      }}
                      placeholder={`Member ${idx + 1} name`}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                      required={idx < registerEvent.team_min}
                      data-testid={`input-member-name-${idx}`}
                    />
                    <input
                      type="email"
                      value={mem.email || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMembers((s) =>
                          s.map((m, i) => (i === idx ? { ...m, email: v } : m))
                        );
                      }}
                      placeholder="Email (optional)"
                      className="w-full sm:w-48 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                      data-testid={`input-member-email-${idx}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRegisterEvent(null)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  data-testid="button-cancel-registration"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg tech-gradient px-4 py-3 font-tech font-semibold text-white hover:shadow-lg transition-all"
                  data-testid="button-submit-registration"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Modal + helpers ---------- */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </motion.div>
  );
}

function toEmbedUrl(url?: string) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.replace('/', '')}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith('/embed/')) return url;
    }
  } catch {}
  return url;
}