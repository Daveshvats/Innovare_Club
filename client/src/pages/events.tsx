import { SplineViewer } from "@/components/spline-viewer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function Events() {
  const featuredRef = useScrollAnimation();
  const timelineRef = useScrollAnimation();

  const timelineEvents = [
    {
      month: "November 2024",
      title: "Code-a-thon Weekend",
      description: "48-hour intensive coding challenge with amazing prizes and mentorship opportunities.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      color: "tech-blue",
    },
    {
      month: "October 2024",
      title: "Blockchain Workshop",
      description: "Hands-on workshop exploring blockchain technology and cryptocurrency development.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      color: "tech-green",
    },
    {
      month: "September 2024",
      title: "IoT Innovation Day",
      description: "Showcase of Internet of Things projects and smart device prototypes by our members.",
      image: "https://pixabay.com/get/gf2ff005a6bb13ecda26515c69fac0bb1d52a8bcaf7b403e34182835ad7e4b48b1a14909a7a6aff47d102a56293e46063ee3dbd3f9eb94c8ddbd9c2c7930cec60_1280.jpg",
      color: "purple-500",
    },
    {
      month: "August 2024",
      title: "AI Ethics Seminar",
      description: "Deep discussion on the ethical implications of artificial intelligence in modern society.",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      color: "tech-blue",
    },
    {
      month: "July 2024",
      title: "Open Source Contribution Drive",
      description: "Month-long initiative to contribute to major open-source projects and build our portfolios.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      color: "tech-green",
    },
    {
      month: "June 2024",
      title: "Startup Pitch Competition",
      description: "Students presented innovative startup ideas to a panel of industry experts and investors.",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      color: "purple-500",
    },
  ];

  return (
    <div className="min-h-screen scroll-smooth">
      {/* Background with Spline */}
      <div className="fixed inset-0 opacity-10 z-0">
        <SplineViewer
          url="https://prod.spline.design/9lGP4ixrHPOUvhzW/scene.splinecode"
          className="w-full h-full parallax"
          cached={true}
        />
      </div>

      <section className="relative z-10 min-h-screen py-12 sm:py-16 lg:py-20 pt-16">
        <div className="responsive-container">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in" data-testid="events-header">
            <h1 className="font-tech text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-tech-dark mb-4 lg:mb-6">Events & Activities</h1>
            <p className="text-lg sm:text-xl text-tech-grey max-w-3xl mx-auto leading-relaxed">
              Discover our latest events, workshops, and technical showcases designed to push the
              boundaries of innovation.
            </p>
          </div>

          {/* Featured Event */}
          <div ref={featuredRef} className="geometric-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-12 lg:mb-16 hover-lift animate-scale-in" data-testid="featured-event">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="h-48 sm:h-64 lg:h-80 rounded-xl overflow-hidden">
                  <SplineViewer
                    url="https://prod.spline.design/9lGP4ixrHPOUvhzW/scene.splinecode"
                    className="w-full h-full"
                    cached={true}
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-4 lg:space-y-6">
                <span className="inline-block px-3 sm:px-4 py-1 sm:py-2 bg-tech-blue text-white font-mono text-xs sm:text-sm rounded-full">
                  Featured Event
                </span>
                <h3 className="font-tech text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-tech-dark">TechFest 2024</h3>
                <p className="text-tech-grey text-sm sm:text-base lg:text-lg leading-relaxed">
                  Our biggest annual event featuring cutting-edge presentations, hands-on workshops,
                  and networking opportunities with industry leaders.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="px-2 sm:px-3 py-1 sm:py-2 bg-tech-light text-tech-dark font-mono text-xs sm:text-sm rounded-lg">
                    March 22-24, 2024
                  </span>
                  <span className="px-2 sm:px-3 py-1 sm:py-2 bg-tech-light text-tech-dark font-mono text-xs sm:text-sm rounded-lg">
                    Innovation Center
                  </span>
                  <span className="px-2 sm:px-3 py-1 sm:py-2 bg-tech-light text-tech-dark font-mono text-xs sm:text-sm rounded-lg">
                    500+ Attendees
                  </span>
                </div>
                <button className="px-6 sm:px-8 py-3 sm:py-4 tech-gradient text-white font-mono font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift" data-testid="learn-more-button">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Timeline of Past Events */}
          <div ref={timelineRef} className="mb-12 lg:mb-16" data-testid="events-timeline">
            <h3 className="font-tech text-2xl sm:text-3xl lg:text-4xl font-bold text-tech-dark text-center mb-8 lg:mb-12 animate-fade-in">
              Event Timeline
            </h3>

            <div className="space-y-8 lg:space-y-12">
              {/* First Row */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {timelineEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className="geometric-card rounded-2xl p-4 sm:p-6 hover-lift animate-bounce-in" style={{animationDelay: `${index * 0.1}s`}} data-testid={`timeline-event-${index}`}>
                    <img
                      src={event.image}
                      alt={event.title}
                      className="rounded-xl w-full h-36 sm:h-48 object-cover mb-3 sm:mb-4"
                      loading="lazy"
                    />
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 bg-${event.color} text-white font-mono text-xs sm:text-sm rounded-full mb-2`}
                    >
                      {event.month}
                    </span>
                    <h4 className="font-tech text-lg sm:text-xl font-bold text-tech-dark mb-2">
                      {event.title}
                    </h4>
                    <p className="text-tech-grey text-xs sm:text-sm leading-relaxed">{event.description}</p>
                  </div>
                ))}
              </div>

              {/* Second Row */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {timelineEvents.slice(3, 6).map((event, index) => (
                  <div key={index + 3} className="geometric-card rounded-2xl p-4 sm:p-6 hover-lift animate-bounce-in" style={{animationDelay: `${(index + 3) * 0.1}s`}} data-testid={`timeline-event-${index + 3}`}>
                    <img
                      src={event.image}
                      alt={event.title}
                      className="rounded-xl w-full h-36 sm:h-48 object-cover mb-3 sm:mb-4"
                      loading="lazy"
                    />
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 bg-${event.color} text-white font-mono text-xs sm:text-sm rounded-full mb-2`}
                    >
                      {event.month}
                    </span>
                    <h4 className="font-tech text-lg sm:text-xl font-bold text-tech-dark mb-2">
                      {event.title}
                    </h4>
                    <p className="text-tech-grey text-xs sm:text-sm leading-relaxed">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
