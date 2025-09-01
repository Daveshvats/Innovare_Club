import { SplineViewer } from "@/components/spline-viewer";
import { CountdownTimer } from "@/components/countdown-timer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { HomeRobot } from "@/components/home-robot";
export default function Home() {
  const heroRef = useScrollAnimation();
  const eventRef = useScrollAnimation();

  return (
    <div className="min-h-screen scroll-smooth">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen pt-16 bg-gradient-to-br from-tech-light via-background to-gray-50"
        data-testid="hero-section"
      >
        <div className="responsive-container py-12 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1 space-y-6 lg:space-y-8">
              <h1 className="font-tech text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-tech-dark leading-tight animate-slide-left">
                Welcome to<br />
                <span className="tech-gradient bg-clip-text text-transparent">Innovare</span>
                <br />
                Technical Club
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-tech-grey max-w-2xl mx-auto lg:mx-0 animate-slide-left" style={{animationDelay: '0.2s'}} data-testid="hero-description">
                Empowering the next generation of tech innovators through cutting-edge projects,
                collaborative learning, and breakthrough solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-bounce-in" style={{animationDelay: '0.4s'}}>
                <button
                  className="px-6 sm:px-8 py-3 sm:py-4 tech-gradient text-white font-mono font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift"
                  data-testid="join-community-button"
                >
                  Join Our Community
                </button>
                <button
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-tech-blue text-tech-blue font-mono font-semibold rounded-xl hover:bg-tech-blue hover:text-white transition-all hover-lift"
                  data-testid="explore-projects-button"
                >
                  Explore Projects
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 animate-float animate-slide-right" data-testid="hero-spline">
             <HomeRobot className="w-16 h-16 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Upcoming Event Section */}
        <div
          ref={eventRef}
          className="responsive-container py-12 sm:py-16 lg:py-20"
          data-testid="upcoming-event-section"
        >
          <div className="text-center mb-12 lg:mb-16 animate-fade-in">
            <h2 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold text-tech-dark mb-4 lg:mb-6">Upcoming Event</h2>
            <p className="text-lg sm:text-xl text-tech-grey">Don't miss our next innovation showcase</p>
          </div>

          <div className="geometric-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto hover-lift animate-scale-in">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="font-tech text-2xl sm:text-3xl lg:text-4xl font-bold text-tech-dark" data-testid="event-title">
                  Tech Fest 2025
                </h3>
                <p className="text-tech-grey text-sm sm:text-base lg:text-lg leading-relaxed" data-testid="event-description">
                  Join the ultimate showcase of innovation and technology where students compete
                  in exciting technical challenges and showcase their skills.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="px-3 py-1 bg-tech-blue text-white text-xs sm:text-sm rounded-full font-mono">
                    Programming
                  </span>
                  <span className="px-3 py-1 bg-tech-green text-white text-xs sm:text-sm rounded-full font-mono">
                    Tech Competition
                  </span>
                  <span className="px-3 py-1 bg-purple-500 text-white text-xs sm:text-sm rounded-full font-mono">
                    Innovation
                  </span>
                </div>
                <div className="flex items-center text-tech-grey text-sm sm:text-base" data-testid="event-details">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="font-mono">October 3, 2025 | 10:00 AM - 6:00 PM</span>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="w-full">
                <CountdownTimer targetDate="2025-10-03T10:00:00" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
