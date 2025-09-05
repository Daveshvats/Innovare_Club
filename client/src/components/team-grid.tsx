import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  description: string;
  imageUrl?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

interface TeamGridProps {
  className?: string;
}

export function TeamGrid({ className = "" }: TeamGridProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const { data: teamMembers, isLoading, error } = useQuery({
    queryKey: ["/api/team"],
    queryFn: async () => {
      const response = await apiRequest("/api/team", "GET");
      return response;
    },
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 1, // Retry failed requests once
    retryDelay: 1000, // Wait 1 second before retry
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error || !teamMembers || teamMembers.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-tech-grey font-tech text-lg">
          No team members found. Check back later!
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {teamMembers.map((member: TeamMember, index: number) => (
          <motion.div
            key={member.id}
            className="group cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            onClick={() => setSelectedMember(member)}
            onMouseEnter={() => setHoveredMember(member.id)}
            onMouseLeave={() => setHoveredMember(null)}
          >
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                {member.imageUrl ? (
                  <motion.img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-tech-blue to-tech-purple flex items-center justify-center">
                    <span className="text-white text-4xl font-bold font-tech">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                
                {/* Overlay */}
                <motion.div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredMember === member.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-white text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: hoveredMember === member.id ? 0 : 20, 
                      opacity: hoveredMember === member.id ? 1 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-lg font-tech font-bold mb-2">View Profile</div>
                    <div className="text-sm opacity-90">Click to learn more</div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6">
                <motion.h3 
                  className="text-xl font-bold font-tech text-tech-dark mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {member.name}
                </motion.h3>
                
                <motion.p 
                  className="text-tech-blue font-tech font-medium mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {member.position}
                </motion.p>
                
                <motion.p 
                  className="text-tech-grey text-sm leading-relaxed line-clamp-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {member.description}
                </motion.p>

                {/* Social Links */}
                {member.socialLinks && (
                  <motion.div 
                    className="flex space-x-3 mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {member.socialLinks.facebook && (
                      <a 
                        href={member.socialLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-tech-grey hover:text-blue-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {member.socialLinks.twitter && (
                      <a 
                        href={member.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-tech-grey hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.socialLinks.instagram && (
                      <a 
                        href={member.socialLinks.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-tech-grey hover:text-pink-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {member.socialLinks.linkedin && (
                      <a 
                        href={member.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-tech-grey hover:text-blue-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.socialLinks.github && (
                      <a 
                        href={member.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-tech-grey hover:text-gray-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedMember(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* Header Image */}
                <div className="h-64 overflow-hidden rounded-t-2xl">
                  {selectedMember.imageUrl ? (
                    <img
                      src={selectedMember.imageUrl}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-tech-blue to-tech-purple flex items-center justify-center">
                      <span className="text-white text-6xl font-bold font-tech">
                        {selectedMember.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-tech-dark hover:bg-white transition-colors"
                >
                  ×
                </button>

                {/* Content */}
                <div className="p-8">
                  <h2 className="text-3xl font-bold font-tech text-tech-dark mb-2">
                    {selectedMember.name}
                  </h2>
                  <p className="text-tech-blue font-tech font-medium text-lg mb-6">
                    {selectedMember.position}
                  </p>
                  <p className="text-tech-grey leading-relaxed mb-6">
                    {selectedMember.description}
                  </p>

                  {/* Social Links */}
                  {selectedMember.socialLinks && (
                    <div className="flex space-x-4">
                      {selectedMember.socialLinks.facebook && (
                        <a 
                          href={selectedMember.socialLinks.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {selectedMember.socialLinks.twitter && (
                        <a 
                          href={selectedMember.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {selectedMember.socialLinks.instagram && (
                        <a 
                          href={selectedMember.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {selectedMember.socialLinks.linkedin && (
                        <a 
                          href={selectedMember.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {selectedMember.socialLinks.github && (
                        <a 
                          href={selectedMember.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
