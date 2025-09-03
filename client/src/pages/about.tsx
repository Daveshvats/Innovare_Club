import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";
import { Team1 } from "@/components/team1";
import { Team2 } from "@/components/team1 copy";
import { Team3 } from "@/components/team3";
import { Team4 } from "@/components/team4";
import { Team5 } from "@/components/team5";
import { Team6 } from "@/components/team6";
import { Team7 } from "@/components/team7";
import { Team8 } from "@/components/team8";
import { TeamCarousel } from "@/components/team-carousel";
export default function About() {
  const missionRef = useScrollAnimation();
  const teamRef = useScrollAnimation();
  const contactRef = useScrollAnimation();

  const teamMembers = [
    { name: "Sahil", position: "President", Avatar: Team1 },
    { name: "Sakshi", position: "Vice President", Avatar: Team2 },
    { name: "Deepanshu", position: "Co-Coordinator", Avatar: Team8 },
    { name: "Saksam", position: "Technical Lead", Avatar: Team3 },
    { name: "Simran", position: "Marketing Head", Avatar: Team6 },
    { name: "Kalash", position: "Design Lead", Avatar: Team4 },
    { name: "Chin", position: "Event Coordinator", Avatar: Team7 },
    { name: "Kunjal", position: "Content Creator", Avatar: Team5 },
  ];



  return (
    <div className="min-h-screen scroll-smooth">
      {/* About Us Section */}
      <section className="min-h-screen py-12 sm:py-16 lg:py-20 bg-white pt-24 sm:pt-28 lg:pt-32">
        <div className="responsive-container">
          {/* Header */}
          <div className="text-center mb-16 lg:mb-20 animate-fade-in" data-testid="about-header">
            <h1 className="font-tech text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-tech-dark mb-6 lg:mb-8">
              About Innovare
            </h1>
            <p className="text-lg sm:text-xl text-tech-grey max-w-4xl mx-auto leading-relaxed">
              Driving technological innovation through collaboration, learning, and breakthrough solutions that shape the future.
            </p>
          </div>

          {/* Mission, Vision, Values */}
          <div ref={missionRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20" data-testid="mission-section">
            <motion.div 
              className="geometric-card rounded-2xl p-6 lg:p-8 text-center"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 tech-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-tech text-xl sm:text-2xl font-bold text-tech-dark mb-3 lg:mb-4">Our Mission</h3>
              <p className="text-tech-grey text-sm sm:text-base leading-relaxed">
                To foster innovation and technical excellence by providing a platform for learning,
                collaboration, and the development of cutting-edge solutions.
              </p>
            </motion.div>

            <motion.div 
              className="geometric-card rounded-2xl p-6 lg:p-8 text-center"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-tech-green rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-tech text-xl sm:text-2xl font-bold text-tech-dark mb-3 lg:mb-4">Our Vision</h3>
              <p className="text-tech-grey text-sm sm:text-base leading-relaxed">
                To be the leading technical community that empowers the next generation of
                innovators to create solutions that transform the world.
              </p>
            </motion.div>

            <motion.div 
              className="geometric-card rounded-2xl p-6 lg:p-8 text-center sm:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-tech text-xl sm:text-2xl font-bold text-tech-dark mb-3 lg:mb-4">Our Values</h3>
              <p className="text-tech-grey text-sm sm:text-base leading-relaxed">
                Innovation, collaboration, excellence, and integrity guide everything we do as we
                build the future of technology together.
              </p>
            </motion.div>
          </div>

          {/* Our Team Section */}
          <div ref={teamRef} className="mb-16 lg:mb-20" data-testid="team-section">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold text-tech-dark mb-4 lg:mb-6">
                Meet Our Team
              </h2>
              <p className="text-lg sm:text-xl text-tech-grey max-w-3xl mx-auto leading-relaxed">
                The innovators driving our technical excellence forward and building the future of technology.
              </p>
            </div>
            
            {/* Team Carousel */}
            <div className="relative">
              <TeamCarousel teamMembers={teamMembers} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
