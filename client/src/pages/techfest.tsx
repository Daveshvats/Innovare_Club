// src/pages/techfest.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple Spline Background Component (fallback if PermanentSplineBg doesn't work)
const SplineBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const appRef = React.useRef<any>(null);

  React.useEffect(() => {
    let Application: any;
    let app: any;

    async function init() {
      if (!canvasRef.current) return;

      try {
        // @ts-ignore - Dynamic import from CDN
        const module = await import('https://unpkg.com/@splinetool/runtime@1.10.51/build/runtime.js');
        Application = module.Application;

        app = new Application(canvasRef.current);
        // Use default background scene
        await app.load('https://prod.spline.design/DC0L-NagpocfiwmY/scene.splinecode');

        appRef.current = app;
      } catch (error) {
        console.error('Failed to load Spline background:', error);
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
  }, []);

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

// ------ Types aligned with your updated API ------

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
  splineRightUrl?: string; // per-event foreground spline
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type RegistrationPayload = {
  technofestId: string; // Updated to use technofestId instead of eventId
  teamName: string;
  members: { name: string; email?: string }[];
  contactEmail: string;
};

export default function Techfest() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [learnMoreEvent, setLearnMoreEvent] = useState<EventItem | null>(null);
  const [registerEvent, setRegisterEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration state (team-size aware)
  const [teamName, setTeamName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [members, setMembers] = useState<{ name: string; email?: string }[]>([]);

  // Fetch events from the new technofest table
  useEffect(() => {
    (async () => {
      try {
        console.log('Fetching technofest events...');
        // Updated to fetch from technofest endpoint
        const res = await fetch('/api/technofest');

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data: EventItem[] = await res.json();
        console.log('Technofest events loaded:', data);

        setEvents(data);
        setError(null);
      } catch (e) {
        console.error('Failed to load technofest events:', e);
        setError(e instanceof Error ? e.message : 'Failed to load events');

        // Add sample data as fallback
        const sampleEvents: EventItem[] = [
          {
            id: '1',
            slug: 'web-dev-challenge',
            name: 'Web Development Challenge',
            number: 1,
            category: 'Development',
            shortDescription: 'Build amazing web applications using modern technologies',
            description: 'A comprehensive web development challenge where participants will build full-stack applications using modern frameworks like React, Node.js, and databases.',
            rules: [
              'Team size: 2-4 members',
              '48-hour deadline', 
              'Use any modern framework',
              'Deploy your project',
              'Submit GitHub repository'
            ],
            youtubeUrl: 'https://youtube.com/watch?v=example',
            teamMin: 2,
            teamMax: 4,
            splineRightUrl: "https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            slug: 'ai-ml-hackathon',
            name: 'AI/ML Hackathon',
            number: 2,
            category: 'Artificial Intelligence',
            shortDescription: 'Solve real-world problems using AI and Machine Learning',
            description: 'Build innovative AI/ML solutions that can make a real impact. Use any framework including TensorFlow, PyTorch, or Scikit-learn.',
            rules: [
              'Team size: 1-3 members',
              '36-hour deadline',
              'Original dataset required',
              'Model accuracy > 80%',
              'Present live demo'
            ],
            teamMin: 1,
            teamMax: 3,
            splineRightUrl: "https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '3',
            slug: 'suit-pursuit',
            name: 'SUIT PURSUIT',
            number: 8,
            category: 'Treasure Hunt',
            shortDescription: 'Ultimate treasure hunt game with tech challenges',
            description: 'Navigate through a series of technical and logical challenges in this exciting treasure hunt. Solve puzzles, crack codes, and race against time!',
            rules: [
              'Team size: 4-5 members',
              'Time limit: 2 hours',
              'Mobile phones allowed',
              'No external help',
              'Follow all clues in sequence'
            ],
            teamMin: 4,
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

  // When opening register, ensure member inputs cover the min requirement
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
      technofestId: registerEvent.id, // Updated to use technofestId
      teamName: teamName.trim(),
      members: filled,
      contactEmail: contactEmail.trim(),
    };

    try {
      console.log('Submitting registration:', payload);

      // Updated API endpoint to use technofest registration
      const res = await fetch(`/api/technofest/${registerEvent.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed registration');
      }

      const result = await res.json();
      console.log('Registration successful:', result);

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
        <SplineBackground className="opacity-30" />
        <div className="flex h-screen items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">Loading TechFest...</div>
            <div className="animate-pulse">Please wait while we load the events</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Spline Background */}
      <SplineBackground className="opacity-40" />

      {error && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg">
          API Error: {error}. Using sample data.
        </div>
      )}

      {/* Scroll container: full-screen, snap per event, smooth scroll */}
      <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
        {events.map((ev, idx) => (
          <div
            key={ev.id}
            className="relative flex h-screen snap-start items-center justify-between px-8 py-16"
          >
            {/* LEFT: Event details & actions */}
            <div className="z-20 flex w-full max-w-lg flex-col space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-sm font-bold uppercase tracking-widest text-cyan-400"
              >
                {ev.number ? `EVENT #${ev.number}` : 'EVENT'}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-5xl font-black text-white"
              >
                {ev.name}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-lg text-white/80"
              >
                {ev.shortDescription}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <button
                  onClick={() => setRegisterEvent(ev)}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-3 font-semibold text-white shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  REGISTER
                </button>
                <button
                  onClick={() => setLearnMoreEvent(ev)}
                  className="rounded-2xl border border-white/40 bg-white/10 px-7 py-3 font-semibold text-white hover:bg-white/20 transition-all duration-300"
                >
                  LEARN MORE
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-sm text-cyan-300"
              >
                <strong>Team size:</strong> {ev.teamMin}–{ev.teamMax} | <strong>Category:</strong> {ev.category}
              </motion.div>
            </div>

            {/* RIGHT: Per-event Spline or placeholder */}
            <div className="absolute right-0 top-0 z-10 h-full w-1/2">
              {ev.splineRightUrl ? (
                <iframe
                  src={ev.splineRightUrl}
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  className="pointer-events-none"
                  title={`Spline for ${ev.name}`}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-white/20">
                    <div className="text-8xl font-black mb-4">#{ev.number || '?'}</div>
                    <div className="text-lg uppercase tracking-wider">{ev.category}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Spacer if no events */}
        {events.length === 0 && (
          <div className="flex h-screen items-center justify-center text-white/60">
            <div className="text-center">
              <div className="text-3xl font-bold mb-4">No TechFest Events</div>
              <div>Check back later for exciting events!</div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Modals ===== */}
      <AnimatePresence>
        {learnMoreEvent && (
          <Modal onClose={() => setLearnMoreEvent(null)}>
            <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gray-900/95 p-8 text-white backdrop-blur border border-gray-700">
              <h2 className="mb-4 text-3xl font-bold text-cyan-400">{learnMoreEvent.name}</h2>

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
                <h3 className="mb-2 text-xl font-semibold text-cyan-300">Description</h3>
                <p className="text-white/80">{learnMoreEvent.description}</p>
              </div>

              {learnMoreEvent.rules?.length ? (
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-semibold text-cyan-300">Rules & Guidelines</h3>
                  <ul className="list-disc space-y-2 pl-5 text-white/80">
                    {learnMoreEvent.rules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <strong className="text-cyan-300">Category:</strong> {learnMoreEvent.category}
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <strong className="text-cyan-300">Team size:</strong> {learnMoreEvent.teamMin}–{learnMoreEvent.teamMax}
                </div>
              </div>

              <button
                onClick={() => setLearnMoreEvent(null)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
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
              <h2 className="mb-4 text-2xl font-bold text-cyan-400">{`Register: ${registerEvent.name}`}</h2>
              <div className="mb-4 text-sm text-white/60">
                Team size: {registerEvent.teamMin}–{registerEvent.teamMax}
              </div>

              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="mb-4 w-full rounded-lg bg-gray-800/50 border border-gray-600 px-3 py-2 text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none"
                required
              />

              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Contact email"
                className="mb-4 w-full rounded-lg bg-gray-800/50 border border-gray-600 px-3 py-2 text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none"
                required
              />

              {/* Dynamic members */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-cyan-300">Team Members</span>
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
                      className="rounded-md bg-cyan-600 hover:bg-cyan-700 px-2 py-1 text-xs text-white transition-colors"
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
                      className="flex-1 rounded-lg bg-gray-800/50 border border-gray-600 px-3 py-2 text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none"
                      required={idx < registerEvent.teamMin}
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
                      className="w-48 rounded-lg bg-gray-800/50 border border-gray-600 px-3 py-2 text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRegisterEvent(null)}
                  className="flex-1 rounded-lg border border-gray-600 px-4 py-3 text-white/80 hover:bg-gray-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-4 py-3 font-semibold text-white transition-all duration-300"
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
