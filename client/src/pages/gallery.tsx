import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function Gallery() {
  const galleryRef = useScrollAnimation();

  const galleryImages = [
    {
      src: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Students coding in programming session",
      title: "Programming Session",
    },
    {
      src: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Modern workspace with analytics dashboard",
      title: "Analytics Dashboard",
    },
    {
      src: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Team collaborating on technical project",
      title: "Team Collaboration",
    },
    {
      src: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Innovation showcase with tech displays",
      title: "Innovation Showcase",
    },
    {
      src: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Students presenting project to audience",
      title: "Project Presentation",
    },
    {
      src: "https://images.pexels.com/photos/1181215/pexels-photo-1181215.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Technical workshop with hands-on learning",
      title: "Technical Workshop",
    },
    {
      src: "https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Electronics project with circuit boards",
      title: "Electronics Project",
    },
    {
      src: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Innovation competition presentation",
      title: "Innovation Competition",
    },
    {
      src: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Tech networking event with professionals",
      title: "Networking Event",
    },
    {
      src: "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Robotics project development session",
      title: "Robotics Development",
    },
    {
      src: "https://images.pexels.com/photos/3862600/pexels-photo-3862600.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "3D printing and prototyping workspace",
      title: "3D Printing Lab",
    },
    {
      src: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      alt: "Pair programming and code review session",
      title: "Code Review Session",
    },
  ];

  return (
    <div className="min-h-screen scroll-smooth">
      <section className="min-h-screen py-12 sm:py-16 lg:py-20 bg-tech-light pt-16">
        <div className="responsive-container">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in" data-testid="gallery-header">
            <h1 className="font-tech text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-tech-dark mb-4 lg:mb-6">Gallery</h1>
            <p className="text-lg sm:text-xl text-tech-grey max-w-3xl mx-auto leading-relaxed">
              Capturing moments of innovation, collaboration, and technical excellence throughout our
              journey.
            </p>
          </div>

          {/* Photo Gallery Grid */}
          <div
            ref={galleryRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            data-testid="gallery-grid"
          >
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group cursor-pointer hover-lift animate-scale-in"
                style={{animationDelay: `${index * 0.05}s`}}
                data-testid={`gallery-image-${index}`}
              >
                <div className="relative overflow-hidden rounded-xl lg:rounded-2xl shadow-lg bg-white">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tech-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-tech font-semibold text-sm sm:text-base">{image.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12 lg:mt-16 animate-bounce-in">
            <button className="px-6 sm:px-8 py-3 sm:py-4 tech-gradient text-white font-mono font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 hover-lift" data-testid="view-more-button">
              View More Photos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
