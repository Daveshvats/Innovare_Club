import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useRef, useEffect } from "react";
import { SplineViewer } from "@/components/spline-viewer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Mail, MapPin, Calendar, Target, Eye, Heart } from "lucide-react";
import { Team1 } from "@/components/team1";
import { Team2 } from "@/components/team1 copy";
import { Team3 } from "@/components/team3";
import { Team4 } from "@/components/team4";
import { Team5 } from "@/components/team5";
import { Team6 } from "@/components/team6";
import { Team7 } from "@/components/team7";
import { Team8 } from "@/components/team8";
export default function About() {
  const missionRef = useScrollAnimation();
  const teamRef = useScrollAnimation();
  const contactRef = useScrollAnimation();

  const teamMembers = [
    { name: "Sahil", color: "tech-blue", Avatar: Team1 },
    { name: "sakshi", color: "tech-green", Avatar: Team2 },
    { name: "Deepanshu", color: "purple-500", Avatar: Team8 },
    { name: "saksam", color: "purple-500", Avatar: Team3 },
    { name: "simran", color: "purple-500", Avatar: Team6 },
    { name: "kalash", color: "tech-blue", Avatar: Team4 },
    { name: "chin", color: "purple-500", Avatar: Team7 },
    { name: "kunjal", color: "tech-green", Avatar: Team5 },
  ];

  // Keen-slider setup for 3-at-a-time and autoplay
  const autoSlideRef = useRef(null);
  const [sliderRef, slider] = useKeenSlider({
    breakpoints: {
      "(min-width: 1024px)": { slides: { perView: 3, spacing: 24 } },
      "(min-width: 640px)": { slides: { perView: 2, spacing: 16 } },
    },
    slides: { perView: 1, spacing: 8 },
    loop: true,
  });

  useEffect(() => {
    if (!slider) return;
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      slider.current?.next();
    }, 2500);
    return () => clearInterval(autoSlideRef.current);
  }, [slider]);

  return (
    <div className="min-h-screen scroll-smooth">
      {/* Header */}
      <section className="min-h-screen py-12 sm:py-16 lg:py-20 bg-tech-light pt-16">
        <div className="responsive-container">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in" data-testid="about-header">
            <h1 className="font-tech text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-tech-dark mb-4 lg:mb-6">
              About Innovare
            </h1>
            <p className="text-lg sm:text-xl text-tech-grey max-w-3xl mx-auto leading-relaxed">
              Driving technological innovation through collaboration, learning, and breakthrough
              solutions that shape the future.
            </p>
          </div>

          {/* Mission, Vision, Values */}
          <div ref={missionRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20" data-testid="mission-section">
            <div className="geometric-card rounded-2xl p-6 lg:p-8 text-center hover-lift animate-scale-in">
              <div className="w-12 h-12 sm:w-16 sm:h-16 tech-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-tech text-xl sm:text-2xl font-bold text-tech-dark mb-3 lg:mb-4">Our Mission</h3>
              <p className="text-tech-grey text-sm sm:text-base leading-relaxed">
                To foster innovation and technical excellence by providing a platform for learning,
                collaboration, and the development of cutting-edge solutions.
              </p>
            </div>

            <div className="geometric-card rounded-2xl p-6 lg:p-8 text-center hover-lift animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-tech-green rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-tech text-xl sm:text-2xl font-bold text-tech-dark mb-3 lg:mb-4">Our Vision</h3>
              <p className="text-tech-grey text-sm sm:text-base leading-relaxed">
                To be the leading technical community that empowers the next generation of
                innovators to create solutions that transform the world.
              </p>
            </div>

            <div className="geometric-card rounded-2xl p-6 lg:p-8 text-center hover-lift animate-scale-in sm:col-span-2 lg:col-span-1" style={{ animationDelay: "0.4s" }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-tech text-xl sm:text-2xl font-bold text-tech-dark mb-3 lg:mb-4">Our Values</h3>
              <p className="text-tech-grey text-sm sm:text-base leading-relaxed">
                Innovation, collaboration, excellence, and integrity guide everything we do as we
                build the future of technology together.
              </p>
            </div>
          </div>

          {/* Team Members Slider */}
          <div ref={teamRef} className="mb-12 lg:mb-16" data-testid="team-section">
            <div className="text-center mb-8 lg:mb-12 animate-fade-in">
              <h3 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold text-tech-dark mb-3 lg:mb-4">Meet Our Team</h3>
              <p className="text-lg sm:text-xl text-tech-grey">
                The innovators driving our technical excellence forward
              </p>
            </div>
            {/* SLIDER */}
            <div ref={sliderRef} className="keen-slider pb-10">
              {teamMembers.map((member, index) => {
                const Avatar = member.Avatar;
                return (
                  <div
                    key={index}
                    className="keen-slider__slide geometric-card rounded-2xl overflow-hidden hover-lift flex flex-col items-center justify-between aspect-square"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    data-testid={`team-member-${index}`}
                  >
                    <div className="w-full h-full flex-1">
                      <Avatar />
                    </div>
                    <div className={`font-bold mt-3 text-lg text-${member.color}`}>
                      {member.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Information */}
          <div ref={contactRef} className="geometric-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center max-w-5xl mx-auto hover-lift animate-scale-in" data-testid="contact-section">
            <h3 className="font-tech text-2xl sm:text-3xl lg:text-4xl font-bold text-tech-dark mb-6 lg:mb-8">Get In Touch</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="animate-bounce-in" style={{ animationDelay: "0.1s" }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 tech-gradient rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="font-mono font-semibold text-tech-dark mb-2 text-sm sm:text-base">Email</h4>
                <p className="text-tech-grey text-xs sm:text-sm" data-testid="contact-email">innovare@techclub.edu</p>
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: "0.2s" }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-tech-green rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="font-mono font-semibold text-tech-dark mb-2 text-sm sm:text-base">Location</h4>
                <p className="text-tech-grey text-xs sm:text-sm" data-testid="contact-location">Tech Building, Room 404</p>
              </div>
              <div className="animate-bounce-in sm:col-span-2 lg:col-span-1" style={{ animationDelay: "0.3s" }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="font-mono font-semibold text-tech-dark mb-2 text-sm sm:text-base">Meetings</h4>
                <p className="text-tech-grey text-xs sm:text-sm" data-testid="contact-meetings">Every Friday, 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
