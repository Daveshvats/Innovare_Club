// src/pages/techfest-technical.tsx

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { HomeRobot } from '@/components/home-robot';

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

export default function TechfestTechnical() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [learnMoreEvent, setLearnMoreEvent] = useState<EventItem | null>(null);
  const [registerEvent, setRegisterEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Registration state
  const [teamName, setTeamName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [members, setMembers] = useState<{ name: string; email?: string }[]>([]);

  // Fetch technical events
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/technofest');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data: EventItem[] = await res.json();
        const technicalEvents = data.filter(event => 
          event.category.toLowerCase().includes('technical') || 
          event.category.toLowerCase().includes('programming') ||
          event.category.toLowerCase().includes('coding') ||
          event.category.toLowerCase().includes('development') ||
          event.category.toLowerCase().includes('hackathon') ||
          event.category.toLowerCase().includes('robotics') ||
          event.category.toLowerCase().includes('ai') ||
          event.category.toLowerCase().includes('tech')
        );
        
        setEvents(technicalEvents);
        setError(null);
      } catch (e) {
        console.error('Failed to load technical events:', e);
        setError(e instanceof Error ? e.message : 'Failed to load events');
        
        // Sample technical events as fallback
        const sampleEvents: EventItem[] = [
          {
            id: '1',
            slug: 'coding-contest',
            name: 'Algorithm Master',
            number: 1,
            category: 'Technical',
            shortDescription: 'Solve complex algorithmic challenges and optimize your code',
            description: 'Test your programming skills with challenging algorithmic problems.',
            rules: ['Individual or team of 2', 'Any programming language', '3 hour time limit'],
            teamMin: 1,
            teamMax: 2,
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

  // Handle scroll-based event switching
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const newIndex = Math.floor(scrollPosition / windowHeight);
      if (newIndex !== currentEventIndex && newIndex < events.length) {
        setCurrentEventIndex(newIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentEventIndex, events.length]);

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

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-30">
          <HomeRobot className="w-full h-full" />
        </div>
        <div className="flex h-screen items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">Loading Technical Events...</div>
            <div className="animate-pulse">Please wait while we load the events</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Back button */}
      <Link href="/techfest">
        <motion.button
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-black/70 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back-to-techfest"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to TechFest
        </motion.button>
      </Link>

      {/* Current Event Background Spline */}
      {events[currentEventIndex]?.splineRightUrl && (
        <EventSpline
          splineUrl={events[currentEventIndex].splineRightUrl}
          className="opacity-40"
        />
      )}

      {/* Page Header */}
      <div className="fixed top-6 right-6 z-50 text-right">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-1"
        >
          Technical Events
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-white/60"
        >
          {currentEventIndex + 1} of {events.length}
        </motion.div>
      </div>

      {error && (
        <div className="fixed top-20 right-6 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg">
          API Error: {error}. Using sample data.
        </div>
      )}

      {/* Event Container */}
      <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            className="relative flex h-screen snap-start items-center justify-between px-8 py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Event Content */}
            <div className="z-20 flex w-full max-w-2xl flex-col space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-sm font-bold uppercase tracking-widest text-blue-400"
              >
                Technical Event #{event.number || idx + 1}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-6xl font-black text-white leading-tight"
              >
                {event.name}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-xl text-white/80 leading-relaxed"
              >
                {event.shortDescription}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <button
                  onClick={() => setRegisterEvent(event)}
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-4 font-semibold text-white shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
                  data-testid={`button-register-${event.id}`}
                >
                  REGISTER NOW
                </button>
                <button
                  onClick={() => setLearnMoreEvent(event)}
                  className="rounded-2xl border border-white/40 bg-white/10 px-8 py-4 font-semibold text-white hover:bg-white/20 transition-all duration-300"
                  data-testid={`button-learn-more-${event.id}`}
                >
                  LEARN MORE
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-sm text-blue-300"
              >
                <strong>Team size:</strong> {event.teamMin}–{event.teamMax} | <strong>Category:</strong> {event.category}
              </motion.div>
            </div>

            {/* Scroll indicator */}
            {idx < events.length - 1 && (
              <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* No events message */}
        {events.length === 0 && (
          <div className="flex h-screen items-center justify-center text-white/60">
            <div className="text-center">
              <div className="text-3xl font-bold mb-4">No Technical Events</div>
              <div>Check back later for exciting technical competitions!</div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {learnMoreEvent && (
          <Modal onClose={() => setLearnMoreEvent(null)}>
            <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gray-900/95 p-8 text-white backdrop-blur border border-gray-700">
              <h2 className="mb-4 text-3xl font-bold text-blue-400">{learnMoreEvent.name}</h2>

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
                <h3 className="mb-2 text-xl font-semibold text-blue-300">Description</h3>
                <p className="text-white/80">{learnMoreEvent.description}</p>
              </div>

              {learnMoreEvent.rules?.length ? (
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-semibold text-blue-300">Rules & Guidelines</h3>
                  <ul className="list-disc space-y-2 pl-5 text-white/80">
                    {learnMoreEvent.rules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <strong className="text-blue-300">Category:</strong> {learnMoreEvent.category}
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <strong className="text-blue-300">Team size:</strong> {learnMoreEvent.teamMin}–{learnMoreEvent.teamMax}
                </div>
              </div>

              <button
                onClick={() => setLearnMoreEvent(null)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
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
              className="w-full max-w-lg rounded-2xl bg-gray-900/95 p-8 text-white backdrop-blur border border-gray-700"
            >
              <h2 className="mb-4 text-2xl font-bold text-blue-400">{`Register: ${registerEvent.name}`}</h2>
              <div className="mb-4 text-sm text-white/60">
                Team size: {registerEvent.teamMin}–{registerEvent.teamMax}
              </div>

              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="mb-4 w-full rounded-lg bg-gray-800/50 border border-gray-600 px-3 py-2 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                required
                data-testid="input-team-name"
              />

              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Contact email"
                className="mb-4 w-full rounded-lg bg-gray-800/50 border border-gray-600 px-3 py-2 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                required
                data-testid="input-contact-email"
              />

              {/* Dynamic members */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-blue-300">Team Members</span>
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
                      className="rounded-md bg-blue-600 hover:bg-blue-700 px-2 py-1 text-xs text-white transition-colors"
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
                      className="rounded-md bg-red-600 hover:bg-red-700 px-2 py-1 text-xs text-white transition-colors"
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
                      className="flex-1 rounded-lg bg-gray-800/50 border border-gray-600 px-3 py-2 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
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
                      className="w-48 rounded-lg bg-gray-800/50 border border-gray-600 px-3 py-2 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                      data-testid={`input-member-email-${idx}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRegisterEvent(null)}
                  className="flex-1 rounded-lg border border-gray-600 px-4 py-3 text-white/80 hover:bg-gray-800/50 transition-colors"
                  data-testid="button-cancel-registration"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-4 py-3 font-semibold text-white transition-all duration-300"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
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