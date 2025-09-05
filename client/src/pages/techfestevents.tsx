// src/pages/techevents.tsx

import React, { useEffect, useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

import { isSplineUrl, isImageUrl, getContentType } from '@/lib/url-utils';
import { createSplineApp } from '@/lib/spline-loader';

// Dynamic component loader for generated Spline components and image fallbacks
const DynamicSplineComponent = memo<{ 
  eventName: string; 
  className?: string; 
  fallbackUrl?: string;
}>(function DynamicSplineComponent({ eventName, className = "", fallbackUrl }) {
  const [SplineComponent, setSplineComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        // Add a small delay to prevent race conditions when multiple components load simultaneously
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        // First, check if we have a fallback URL and determine its type
        if (fallbackUrl) {
          const contentType = getContentType(fallbackUrl);
          console.log(`Event: ${eventName}, URL: ${fallbackUrl}, Content Type: ${contentType}`);
          
          if (contentType === 'image' || contentType === 'video') {
            console.log(`Detected ${contentType} URL for ${eventName}, skipping Spline component loading`);
            setIsLoading(false);
            return;
          }
          
          if (contentType === 'spline') {
            console.log(`Detected Spline URL for ${eventName}, will try generated component first`);
            // Don't return here - continue to try loading the generated component
          }
        }

        // Try to load generated component for Spline URLs or when no fallback URL
        console.log(`Trying to load generated component for ${eventName}`);
        
        // Convert event name to component name (same logic as component generator)
        const componentName = eventName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        console.log(`Loading component for event: ${eventName} -> ${componentName}.tsx`);
        
        // Try to dynamically import the generated component
        const componentModule = await import(`@/components/generated/${componentName}.tsx`);
        
        // The component is exported with PascalCase (each word capitalized, no spaces)
        const exportName = eventName
          .split(/[^a-zA-Z0-9]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        console.log(`Looking for export: ${exportName}`);
        const ComponentClass = componentModule[exportName];
        
        if (ComponentClass) {
          console.log(`Successfully loaded component: ${exportName}`);
          setSplineComponent(() => ComponentClass);
        } else {
          console.log(`Component ${exportName} not found in module. Available exports:`, Object.keys(componentModule));
        }
      } catch (error) {
        console.log(`No generated component found for ${eventName}, using fallback:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [eventName, fallbackUrl]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If we have a Spline component, use it
  if (SplineComponent) {
    return <SplineComponent className={className} />;
  }

  // Handle fallback URL
  if (fallbackUrl) {
    const contentType = getContentType(fallbackUrl);
    
    // If it's a regular image URL, render as image
    if (contentType === 'image') {
      return (
        <div className={`w-full h-full ${className}`}>
          <img 
            src={fallbackUrl}
            alt={`${eventName} visual`}
            className="w-full h-full object-cover rounded-xl"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.75rem'
            }}
            loading="lazy"
            onError={(e) => {
              console.error('Failed to load image:', fallbackUrl);
              // Fallback to a placeholder if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }
    
    // If it's a video URL, render as video
    if (contentType === 'video') {
      return (
        <div className={`w-full h-full ${className}`}>
          <video 
            src={fallbackUrl}
            className="w-full h-full object-cover rounded-xl"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.75rem'
            }}
            controls
            muted
            loop
            playsInline
            onError={(e) => {
              console.error('Failed to load video:', fallbackUrl);
            }}
          />
        </div>
      );
    }
    
    // If it's a Spline URL, render as iframe
    if (contentType === 'spline') {
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
            title={`${eventName} Spline scene`}
            loading="lazy"
          />
        </div>
      );
    }

    // For any other URL, try as iframe first, then fallback to image
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
          title="Visual Content"
          loading="lazy"
          onError={(e) => {
            // If iframe fails, try as image
            const iframe = e.currentTarget as HTMLIFrameElement;
            const container = iframe.parentElement;
            if (container) {
              container.innerHTML = `
                <img 
                  src="${fallbackUrl}" 
                  alt="Event visual" 
                  class="w-full h-full object-cover rounded-xl"
                  style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem;"
                  loading="lazy"
                />
              `;
            }
          }}
        />
      </div>
    );
  }

  return null;
});

const TechEventsBackground = memo<{ className?: string }>(function TechEventsBackground({ className = "" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let app: any;
    let canceled = false;

    async function init() {
      if (!canvasRef.current || canceled) return;

      // Wait for canvas to have proper dimensions
      const waitForCanvasSize = () => {
        return new Promise<void>((resolve) => {
          const checkSize = () => {
            if (canvasRef.current && !canceled) {
              const rect = canvasRef.current.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                resolve();
              } else {
                requestAnimationFrame(checkSize);
              }
            } else {
              resolve();
            }
          };
          checkSize();
        });
      };

      try {
        setIsLoading(true);
        setError(null);
        
        await waitForCanvasSize();
        
        if (!canvasRef.current || canceled) return;

        // Use shared Spline runtime loader
        app = await createSplineApp(canvasRef.current, 1.5); // Lower DPR for background

        if (canceled) {
          app.destroy?.();
          return;
        }

        // Load the specific Spline scene
        await app.load('https://prod.spline.design/DC0L-NagpocfiwmY/scene.splinecode');

        if (!canceled) {
          appRef.current = app;
          setIsLoading(false);
        } else {
          app.destroy?.();
        }
      } catch (error) {
        console.error('Failed to load TechEvents background scene:', error);
        setError(error instanceof Error ? error.message : 'Failed to load background scene');
        setIsLoading(false);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      canceled = true;
      if (appRef.current) {
        try {
          appRef.current.destroy?.();
        } catch (error) {
          console.warn('Error destroying TechEvents background app:', error);
        }
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 w-full h-full -z-10 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-tech-blue/10 to-tech-green/10">
          <div className="text-center">
            <div className="animate-pulse text-tech-grey">Loading background...</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/50">
          <div className="text-center p-4">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <p className="text-sm text-red-600">Background failed to load</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          background: 'transparent',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          minWidth: '1px',
          minHeight: '1px'
        }}
      />
    </div>
  );
});

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

const TechEvents = memo(function TechEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [learnMoreEvent, setLearnMoreEvent] = useState<EventItem | null>(null);
  const [registerEvent, setRegisterEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Registration state
  const [teamName, setTeamName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [members, setMembers] = useState<{ name: string; email?: string }[]>([]);

  // Get category from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

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

  // Filter events based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = events.filter(event => 
        event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [selectedCategory, events]);

  // Handle scroll-based event switching with intersection observer for immediate pop-up effect
  useEffect(() => {
    if (filteredEvents.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px 0px 0px', // No margin for immediate triggering
      threshold: 0.1 // Very low threshold for immediate triggering
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

  // Enhanced scroll snap behavior for single-scroll navigation
  useEffect(() => {
    const container = document.querySelector('.overflow-y-scroll');
    if (!container) return;

    // Add CSS for more aggressive scroll snapping
    const style = document.createElement('style');
    style.textContent = `
      .overflow-y-scroll {
        scroll-snap-type: y mandatory !important;
        scroll-snap-stop: always !important;
        scroll-behavior: smooth !important;
      }
      .scroll-snap-start {
        scroll-snap-align: start !important;
        scroll-snap-stop: always !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [filteredEvents.length]);

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
    <div className="min-h-screen pt-16 scroll-smooth">
      {/* Background Spline */}
      <div className="absolute inset-0 z-0">
        <TechEventsBackground />
      </div>

      {/* Events Display Section */}
      {filteredEvents.length > 0 && (
        <section className="min-h-screen" style={{ scrollBehavior: 'smooth' }}>
          {/* Event Pages with Parallax Scrolling */}
          <div 
            className="overflow-y-scroll relative scroll-smooth"
            style={{
              height: 'calc(100dvh - 4rem)',
              scrollPaddingTop: '4rem',
              scrollBehavior: 'smooth',
              scrollSnapType: 'y mandatory',
              scrollSnapStop: 'always'
            }}
          >
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                data-event-index={idx}
                className="h-screen bg-transparent flex items-center justify-center relative scroll-snap-start"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for pop-up effect
                    delay: 0.1
                  }
                }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                viewport={{ once: false, amount: 0.1, margin: '0px' }}
              >
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  {/* Event Content - Centered */}
                  <motion.div 
                    className="flex-1 space-y-6 text-center lg:text-left lg:max-w-2xl px-2 sm:px-0"
                    initial={{ opacity: 0, y: 30, x: -20 }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0, 
                      x: 0,
                      transition: {
                        duration: 0.8,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: 0.2
                      }
                    }}
                    viewport={{ once: false, amount: 0.1, margin: '0px' }}
                  >
                    <div className="text-sm font-tech font-bold uppercase tracking-widest text-tech-blue">
                      Event #{event.number || idx + 1}
                    </div>
                    <h3 className="font-tech text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-tech-dark leading-tight">
                      {event.name}
                    </h3>
                    <p className="text-lg md:text-xl lg:text-2xl text-tech-grey leading-relaxed max-w-2xl mx-auto lg:mx-0">
                      {event.short_description}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      <span className="px-4 py-2 bg-tech-blue text-white text-sm md:text-base rounded-full font-mono">
                        {event.category}
                      </span>
                      <span className="px-4 py-2 bg-tech-green text-white text-sm md:text-base rounded-full font-mono">
                        Team: {event.team_min}–{event.team_max}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <button
                        onClick={() => setRegisterEvent(event)}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                        data-testid={`button-register-${event.id}`}
                      >
                        Register Now
                      </button>
                      <button
                        onClick={() => setLearnMoreEvent(event)}
                        className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                        data-testid={`button-learn-more-${event.id}`}
                      >
                        Learn More
                      </button>
                    </div>
                  </motion.div>

                  {/* Event Visual - Centered */}
                  <motion.div 
                    className="flex-shrink-0 relative z-20 flex items-center justify-center"
                    initial={{ opacity: 0, x: 50, scale: 0.8, rotateY: 15 }}
                    whileInView={{ 
                      opacity: 1, 
                      x: 0, 
                      scale: 1, 
                      rotateY: 0,
                      transition: {
                        duration: 0.8,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: 0.3
                      }
                    }}
                    viewport={{ once: false, amount: 0.1, margin: '0px' }}
                  >
                    {(() => {
                      console.log(`Event: ${event.name}, Spline URL: ${event.spline_right_url}`);
                      if (event.spline_right_url) {
                        const contentType = getContentType(event.spline_right_url);
                        console.log(`Content type for ${event.name}: ${contentType}`);
                      }
                      return null;
                    })()}
                    {event.spline_right_url ? (
                      <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] spline-container rounded-xl overflow-hidden bg-transparent flex items-center justify-center">
                        <DynamicSplineComponent
                          eventName={event.name}
                          fallbackUrl={event.spline_right_url}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] bg-gradient-to-br from-tech-blue/30 to-tech-green/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <div className="text-center text-white">
                          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-tech font-bold mb-2">#{event.number || idx + 1}</div>
                          <div className="text-sm sm:text-base md:text-lg lg:text-xl font-tech uppercase tracking-wider">{event.category}</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Scroll Icon - Only on last event */}
                {idx === filteredEvents.length - 1 && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <svg 
                          className="w-8 h-8 text-white/80" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                          />
                        </svg>
                      </motion.div>
                      <span className="text-xs font-tech text-white/60 mt-2">Scroll to explore more</span>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* No events message */}
      {filteredEvents.length === 0 && !loading && (
        <section className="py-20 bg-gradient-to-br from-tech-light via-background to-gray-50">
          <div className="responsive-container text-center">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl p-12 rounded-2xl max-w-2xl mx-auto">
              <h3 className="font-tech text-2xl font-bold text-tech-dark mb-4">
                No Events Available
              </h3>
              <p className="text-tech-grey mb-6">
                Check back later for exciting competitions!
              </p>
              <button
                onClick={() => window.location.href = '/techfest'}
                className="px-8 py-4 tech-gradient text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Back to TechFest
              </button>
            </div>
          </div>
        </section>
      )}

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
                Team size: {registerEvent.team_min}–{registerEvent.team_max} (includes 1 leader + {registerEvent.team_min - 1}–{registerEvent.team_max - 1} members)
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

              {/* Team Leader Section */}
              <div className="mb-4">
                <span className="font-tech font-semibold text-tech-blue dark:text-tech-green mb-2 block">Team Leader</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={members[0]?.name || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMembers((s) => {
                        const newMembers = [...s];
                        if (newMembers.length === 0) newMembers.push({ name: '', email: '' });
                        newMembers[0] = { ...newMembers[0], name: v };
                        return newMembers;
                      });
                    }}
                    placeholder="Team Leader Name"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                    required
                    data-testid="input-leader-name"
                  />
                  <input
                    type="email"
                    value={members[0]?.email || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMembers((s) => {
                        const newMembers = [...s];
                        if (newMembers.length === 0) newMembers.push({ name: '', email: '' });
                        newMembers[0] = { ...newMembers[0], email: v };
                        return newMembers;
                      });
                    }}
                    placeholder="Team Leader Email"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                    required
                    data-testid="input-leader-email"
                  />
                </div>
              </div>

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
                  <span className="font-tech font-semibold text-tech-blue dark:text-tech-green">Additional Team Members</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMembers((m) =>
                          m.length < (registerEvent.team_max || 20)
                            ? [...m, { name: '', email: '' }]
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
                          m.length > 1 ? m.slice(0, -1) : m
                        )
                      }
                      className="rounded-md bg-red-500 hover:bg-red-600 px-2 py-1 text-xs text-white transition-colors"
                      data-testid="button-remove-member"
                    >
                      − Remove
                    </button>
                  </div>
                </div>

                {members.slice(1).map((mem, idx) => (
                  <div key={idx} className="mb-3 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={mem.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMembers((s) =>
                          s.map((m, i) => (i === idx + 1 ? { ...m, name: v } : m))
                        );
                      }}
                      placeholder={`Member ${idx + 1} name`}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
                      required={idx + 1 < registerEvent.team_min}
                      data-testid={`input-member-name-${idx}`}
                    />
                    <input
                      type="email"
                      value={mem.email || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMembers((s) =>
                          s.map((m, i) => (i === idx + 1 ? { ...m, email: v } : m))
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
});

export default TechEvents;

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