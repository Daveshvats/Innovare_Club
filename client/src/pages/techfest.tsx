// src/pages/techfest.tsx

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeRobot } from '@/components/home-robot';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// Event spline component for individual events
const EventSpline: React.FC<{ splineUrl?: string; className?: string }> = ({ splineUrl, className = "" }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const appRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!splineUrl) return;
    
    let Application: any;
    let app: any;

    async function init() {
      if (!canvasRef.current) return;

      try {
        // @ts-ignore - Dynamic import from CDN
        const module = await import('https://unpkg.com/@splinetool/runtime@1.10.51/build/runtime.js');
        Application = module.Application;

        app = new Application(canvasRef.current);
        await app.load(splineUrl);
        appRef.current = app;
      } catch (error) {
        console.error('Failed to load event Spline:', error);
      }
    }

    init();

    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy();
        } catch (error) {
          console.error('Error destroying Spline app:', error);
        }
        appRef.current = null;
      }
    };
  }, [splineUrl]);

  if (!splineUrl) return null;

  return (
    <div className={`absolute inset-0 ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

type EventItem = {
  id: string;
  slug?: string;
  name: string;
  number?: number;
  category: string;
  shortDescription: string;
  description: string;
  rules: string[];
  youtubeUrl?: string;
  teamMin: number;
  teamMax: number;
  splineRightUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
    id: 'cultural',
    name: 'Cultural Events',
    description: 'Art, music, dance and creative competitions',
    color: 'purple',
    icon: '🎭'
  },
  {
    id: 'sports', 
    name: 'Sports Events',
    description: 'Athletic competitions and physical challenges',
    color: 'green',
    icon: '⚽'
  },
  {
    id: 'technical',
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
        
        // Sample events as fallback
        const sampleEvents: EventItem[] = [
          {
            id: '1',
            slug: 'art-showcase',
            name: 'Digital Art Showcase',
            number: 1,
            category: 'cultural',
            shortDescription: 'Express your creativity through digital art and design',
            description: 'Create stunning digital artwork using modern tools and showcase your artistic vision.',
            rules: ['Individual participation', 'Original artwork only', 'Submit in high resolution'],
            teamMin: 1,
            teamMax: 1,
            splineRightUrl: "https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            slug: 'coding-contest',
            name: 'Algorithm Master',
            number: 2,
            category: 'technical',
            shortDescription: 'Solve complex algorithmic challenges and optimize your code',
            description: 'Test your programming skills with challenging algorithmic problems.',
            rules: ['Individual or team of 2', 'Any programming language', '3 hour time limit'],
            teamMin: 1,
            teamMax: 2,
            splineRightUrl: "https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '3',
            slug: 'esports-tournament',
            name: 'E-Sports Championship',
            number: 3,
            category: 'sports',
            shortDescription: 'Compete in the ultimate gaming tournament',
            description: 'Battle it out in popular games and showcase your gaming skills.',
            rules: ['Team of 5 players', 'Bring your own devices', 'Fair play required'],
            teamMin: 5,
            teamMax: 5,
            splineRightUrl: "https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
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
        event.category.toLowerCase().includes(selectedCategory) ||
        (selectedCategory === 'cultural' && (event.category.toLowerCase().includes('art') || event.category.toLowerCase().includes('music') || event.category.toLowerCase().includes('dance') || event.category.toLowerCase().includes('creative'))) ||
        (selectedCategory === 'sports' && (event.category.toLowerCase().includes('sport') || event.category.toLowerCase().includes('athletic') || event.category.toLowerCase().includes('physical') || event.category.toLowerCase().includes('fitness') || event.category.toLowerCase().includes('game'))) ||
        (selectedCategory === 'technical' && (event.category.toLowerCase().includes('technical') || event.category.toLowerCase().includes('programming') || event.category.toLowerCase().includes('coding') || event.category.toLowerCase().includes('development') || event.category.toLowerCase().includes('hackathon') || event.category.toLowerCase().includes('robotics') || event.category.toLowerCase().includes('ai') || event.category.toLowerCase().includes('tech')))
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [selectedCategory, events]);

  // Handle scroll-based event switching
  useEffect(() => {
    if (filteredEvents.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const eventSectionStart = windowHeight; // Events start after hero section
      
      if (scrollPosition > eventSectionStart) {
        const newIndex = Math.floor((scrollPosition - eventSectionStart) / windowHeight);
        if (newIndex !== currentEventIndex && newIndex < filteredEvents.length && newIndex >= 0) {
          setCurrentEventIndex(newIndex);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentEventIndex, filteredEvents.length]);

  // Registration handlers
  useEffect(() => {
    if (!registerEvent) return;
    setMembers((cur) => {
      const want = Math.max(registerEvent.teamMin || 1, 1);
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
      filled.length < registerEvent.teamMin ||
      filled.length > registerEvent.teamMax
    ) {
      alert(
        `Please provide between ${registerEvent.teamMin} and ${registerEvent.teamMax} team members.`
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
        className="min-h-screen bg-gradient-to-br from-tech-light via-background to-gray-50"
        data-testid="techfest-hero-section"
      >
        <div className="responsive-container py-12 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-bounce-in" style={{animationDelay: '0.4s'}}>
                {!selectedCategory ? (
                  <button
                    onClick={() => setShowCategoryDialog(true)}
                    className="px-8 py-4 tech-gradient text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift"
                    data-testid="button-browse-events"
                  >
                    Browse Events
                  </button>
                ) : (
                  <button
                    onClick={handleBackToCategories}
                    className="px-8 py-4 border-2 border-tech-blue text-tech-blue font-tech font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all hover-lift"
                    data-testid="button-back-to-categories"
                  >
                    Back to Categories
                  </button>
                )}
                <button
                  className="px-8 py-4 border-2 border-tech-blue text-tech-blue font-tech font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all hover-lift"
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
        <section className="min-h-screen">
          {/* Category Header */}
          <div className="bg-gradient-to-br from-tech-light via-background to-gray-50 py-16">
            <div className="responsive-container">
              <div className="text-center mb-12">
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
            {/* Current Event Background Spline */}
            {filteredEvents[currentEventIndex]?.splineRightUrl && (
              <EventSpline
                splineUrl={filteredEvents[currentEventIndex].splineRightUrl}
                className="opacity-20 fixed inset-0"
              />
            )}

            {/* Event Pages */}
            <div className="snap-y snap-mandatory">
              {filteredEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="min-h-screen snap-start bg-gradient-to-br from-tech-light/50 via-background/50 to-gray-50/50 backdrop-blur-sm"
                >
                  <div className="responsive-container py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      {/* Event Content */}
                      <div className="space-y-6">
                        <div className="text-sm font-tech font-bold uppercase tracking-widest text-tech-blue">
                          Event #{event.number || idx + 1}
                        </div>
                        <h3 className="font-tech text-4xl sm:text-5xl lg:text-6xl font-bold text-tech-dark leading-tight">
                          {event.name}
                        </h3>
                        <p className="text-lg sm:text-xl text-tech-grey leading-relaxed">
                          {event.shortDescription}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-tech-blue text-white text-sm rounded-full font-mono">
                            {event.category}
                          </span>
                          <span className="px-3 py-1 bg-tech-green text-white text-sm rounded-full font-mono">
                            Team: {event.teamMin}–{event.teamMax}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setRegisterEvent(event)}
                            className="px-8 py-4 tech-gradient text-white font-tech font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift"
                            data-testid={`button-register-${event.id}`}
                          >
                            Register Now
                          </button>
                          <button
                            onClick={() => setLearnMoreEvent(event)}
                            className="px-8 py-4 border-2 border-tech-blue text-tech-blue font-tech font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all hover-lift"
                            data-testid={`button-learn-more-${event.id}`}
                          >
                            Learn More
                          </button>
                        </div>
                      </div>

                      {/* Event Visual */}
                      <div className="geometric-card p-8 rounded-2xl">
                        {event.splineRightUrl ? (
                          <div className="aspect-square spline-container rounded-xl overflow-hidden">
                            <iframe
                              src={event.splineRightUrl}
                              className="w-full h-full border-0"
                              title={`3D model for ${event.name}`}
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-tech-blue to-tech-green rounded-xl flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-6xl font-tech font-bold mb-4">#{event.number || idx + 1}</div>
                              <div className="text-xl font-tech uppercase tracking-wider">{event.category}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scroll indicator */}
                    {idx < filteredEvents.length - 1 && (
                      <div className="flex justify-center mt-16">
                        <div className="animate-bounce text-tech-grey">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No events message */}
      {selectedCategory && filteredEvents.length === 0 && (
        <section className="py-20 bg-gradient-to-br from-tech-light via-background to-gray-50">
          <div className="responsive-container text-center">
            <div className="geometric-card p-12 rounded-2xl max-w-2xl mx-auto">
              <h3 className="font-tech text-2xl font-bold text-tech-dark mb-4">
                No {categories.find(c => c.id === selectedCategory)?.name} Available
              </h3>
              <p className="text-tech-grey mb-6">
                Check back later for exciting {selectedCategory} competitions!
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
        {showCategoryDialog && (
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
              className="bg-background rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-border"
            >
              <div className="text-center mb-8">
                <h3 className="font-tech text-3xl font-bold text-tech-dark mb-4">
                  Choose Your Category
                </h3>
                <p className="text-tech-grey">
                  Select a category to explore available events
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="geometric-card p-6 rounded-xl hover:shadow-lg transition-all hover-lift text-left group"
                    data-testid={`category-${category.id}`}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <h4 className="font-tech text-xl font-bold text-tech-dark mb-2 group-hover:text-tech-blue transition-colors">
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

              {learnMoreEvent.youtubeUrl && (
                <div className="mb-6">
                  <iframe
                    width="100%"
                    height="315"
                    src={toEmbedUrl(learnMoreEvent.youtubeUrl)}
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
                <div className="geometric-card p-3 rounded-lg">
                  <strong className="text-tech-blue">Category:</strong> {learnMoreEvent.category}
                </div>
                <div className="geometric-card p-3 rounded-lg">
                  <strong className="text-tech-blue">Team size:</strong> {learnMoreEvent.teamMin}–{learnMoreEvent.teamMax}
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
              className="w-full max-w-lg rounded-2xl bg-background p-8 shadow-2xl border border-border"
            >
              <h2 className="mb-4 text-2xl font-tech font-bold text-tech-dark">{`Register: ${registerEvent.name}`}</h2>
              <div className="mb-4 text-sm text-tech-grey">
                Team size: {registerEvent.teamMin}–{registerEvent.teamMax}
              </div>

              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-tech-blue focus:outline-none"
                required
                data-testid="input-team-name"
              />

              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Contact email"
                className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-tech-blue focus:outline-none"
                required
                data-testid="input-contact-email"
              />

              {/* Dynamic members */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-tech font-semibold text-tech-blue">Team Members</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMembers((m) =>
                          m.length < (registerEvent.teamMax || 20)
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
                          m.length > registerEvent.teamMin ? m.slice(0, -1) : m
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
                  <div key={idx} className="mb-3 flex gap-2">
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
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-tech-blue focus:outline-none"
                      required={idx < registerEvent.teamMin}
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
                      className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-tech-blue focus:outline-none"
                      data-testid={`input-member-email-${idx}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRegisterEvent(null)}
                  className="flex-1 rounded-lg border border-border px-4 py-3 text-foreground hover:bg-muted transition-colors"
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