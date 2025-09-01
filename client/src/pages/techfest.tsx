// src/pages/techfest.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { HomeRobot } from '@/components/home-robot';

// Main TechFest landing page with category selection
export default function Techfest() {
  const categories = [
    {
      id: 'cultural',
      name: 'Cultural Events',
      description: 'Art, music, dance and creative competitions',
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      route: '/techfest/cultural'
    },
    {
      id: 'sports', 
      name: 'Sports Events',
      description: 'Athletic competitions and physical challenges',
      gradient: 'from-green-500 via-teal-500 to-blue-500',
      route: '/techfest/sports'
    },
    {
      id: 'technical',
      name: 'Technical Events', 
      description: 'Programming, robotics and technical challenges',
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      route: '/techfest/technical'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Spline Background */}
      <div className="absolute inset-0 opacity-30">
        <HomeRobot className="w-full h-full" />
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/80" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div 
            className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Innovare presents
          </motion.div>
          <motion.h1 
            className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            TECHFEST
          </motion.h1>
          <motion.p 
            className="text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Choose your battleground and showcase your skills in our exciting competitions
          </motion.p>
        </motion.div>

        {/* Category Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-6xl w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group"
            >
              <Link href={category.route}>
                <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${category.gradient} opacity-90 hover:opacity-100 transition-all duration-500 cursor-pointer overflow-hidden min-h-[320px] flex flex-col justify-between`}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-sm font-bold uppercase tracking-wider text-white/90 mb-3">
                      Events
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 group-hover:text-yellow-300 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="relative z-10 pt-6">
                    <div className="flex items-center justify-between">
                      <motion.div 
                        className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white font-semibold group-hover:bg-white/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Explore Events
                      </motion.div>
                      <motion.div
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300"
                        whileHover={{ rotate: 90 }}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
                  <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/5 blur-lg" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.div
          className="mt-16 text-center text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <p className="text-sm">
            Ready to compete? Select a category above to view and register for events
          </p>
        </motion.div>
      </div>
    </div>
  );
}


