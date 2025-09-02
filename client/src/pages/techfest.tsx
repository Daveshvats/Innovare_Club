// src/pages/techfest.tsx

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

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
        await app.load('https://prod.spline.design/AYO2dvuQ1LGfA3dM/scene.splinecode');

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
    <div className={`fixed inset-0 w-full h-full -z-10 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          background: 'transparent',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
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
  const [loading, setLoading] = useState(true);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  useEffect(() => {
    // Simulate loading time for the hero section
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setShowCategoryDialog(false);
    // Navigate to techevents page with category parameter
    window.location.href = `/techfestevents?category=${categoryId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-tech-light via-background to-gray-50">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-tech font-bold mb-4 text-tech-dark">Loading TechFest...</div>
            <div className="animate-pulse text-tech-grey">Please wait while we load the experience</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 scroll-smooth">
      {/* Hero Section */}
      <section
        className="min-h-screen relative overflow-hidden"
        style={{
          height: 'calc(100dvh - 4rem)',
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 25%, #a8edea 50%, #fed6e3 75%, #d299c2 100%)'
        }}
        data-testid="techfest-hero-section"
      >
        {/* Background Spline */}
        <div className="absolute inset-0 z-0">
          <TechFestBackground />
        </div>
        <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 lg:space-y-8 w-full max-w-4xl mx-auto relative z-20">
            <div className="text-sm font-tech font-bold uppercase tracking-widest text-orange-300/80 mb-4 text-center">
             
            </div>
            {/* rember this contains unique characters if you are seeing this then you dont see them :)*/}
            <motion.h1 
              className="font-tech text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-none mb-8 text-center"
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              "‎‎‎"
            </motion.h1>
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className="mt-8 flex justify-center"
            >
              <HoverBorderGradient
                as="button"
                onClick={() => setShowCategoryDialog(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-tech font-bold text-lg tracking-wide"
                containerClassName="rounded-full"
                data-testid="button-explore-events"
              >
                EXPLORE EVENTS →
              </HoverBorderGradient>
            </motion.div>

            {/* Animated Scroll Indicator */}
            
          </div>
        </div>
      </section>

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
    </div>
  );
}