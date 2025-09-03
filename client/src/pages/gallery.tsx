import { useState } from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
}

export default function Gallery() {
  const galleryRef = useScrollAnimation();
  
  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  const { data: galleryImages, isLoading, error } = useQuery({
    queryKey: ["/api/gallery"],
    queryFn: () => apiRequest<GalleryImage[]>("/api/gallery", "GET"),
  });



  // Fallback images if database is empty or loading
  const fallbackImages = [
    {
      id: "fallback-1",
      title: "Programming Session",
      imageUrl: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      description: "Students coding in programming session",
    },
    {
      id: "fallback-2", 
      title: "Analytics Dashboard",
      imageUrl: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      description: "Modern workspace with analytics dashboard",
    },
    {
      id: "fallback-3",
      title: "Team Collaboration", 
      imageUrl: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      description: "Team collaborating on technical project",
    },
    {
      id: "fallback-4",
      title: "Innovation Showcase",
      imageUrl: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop", 
      description: "Innovation showcase with tech displays",
    },
  ];

  // Ensure we only show gallery images, not event images
  const displayImages = galleryImages && galleryImages.length > 0 
    ? galleryImages.filter(img => img.id && img.imageUrl && img.title) // Filter out any invalid entries
    : fallbackImages;
  


  // Carousel navigation functions
  const openCarousel = (index: number) => {
    setCurrentImageIndex(index);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen scroll-smooth">
      <section className="min-h-screen py-12 sm:py-16 lg:py-20 bg-tech-light pt-24 sm:pt-28 lg:pt-32">
        <div className="responsive-container">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in" data-testid="gallery-header">
            <h1 className="font-tech text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-tech-dark mb-4 lg:mb-6">Gallery</h1>
            <p className="text-lg sm:text-xl text-tech-grey max-w-3xl mx-auto leading-relaxed">
              Capturing moments of innovation, collaboration, and technical excellence throughout our
              journey.
            </p>
            {!isLoading && !error && galleryImages && galleryImages.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-tech text-sm">
                  No gallery images found. Add images through the admin panel to populate the gallery.
                </p>
              </div>
            )}
          </div>

          {/* Photo Gallery Carousel */}
          <div ref={galleryRef} className="mb-12 lg:mb-16" data-testid="gallery-carousel">
            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <div className="w-full h-48 sm:h-56 lg:h-64 bg-gray-300 rounded-xl lg:rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error state
              <div className="text-center py-12">
                <p className="text-tech-grey font-tech">Failed to load gallery images. Showing sample images.</p>
              </div>
            ) : displayImages.length === 0 ? (
              // No images state
              <div className="text-center py-12">
                <p className="text-tech-grey font-tech">No gallery images available. Please add some images through the admin panel.</p>
              </div>
            ) : (
              <>
                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
                  {displayImages.map((image, index) => (
                    <motion.div
                      key={image.id}
                      className="group cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      onClick={() => openCarousel(index)}
                      data-testid={`gallery-image-${index}`}
                    >
                      <div className="relative overflow-hidden rounded-xl lg:rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                        <img
                          src={image.imageUrl}
                          alt={image.description || image.title}
                          className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-tech-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-tech font-semibold text-sm sm:text-base">{image.title}</h3>
                          {image.description && (
                            <p className="text-white/90 font-tech text-xs mt-1">{image.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Image Expansion Modal */}
                <AnimatePresence>
                  {isCarouselOpen && (
                    <motion.div
                      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={closeCarousel}
                    >
                      <motion.div
                        className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Close Button */}
                        <button
                          onClick={closeCarousel}
                          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                          aria-label="Close carousel"
                        >
                          <X className="w-6 h-6" />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Main Image */}
                        <motion.div
                          key={currentImageIndex}
                          className="relative max-w-4xl max-h-[80vh] w-full"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={displayImages[currentImageIndex].imageUrl}
                            alt={displayImages[currentImageIndex].description || displayImages[currentImageIndex].title}
                            className="w-full h-full object-contain rounded-lg"
                          />
                          
                          {/* Image Info */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                            <h3 className="text-white font-tech text-xl font-semibold mb-2">
                              {displayImages[currentImageIndex].title}
                            </h3>
                            {displayImages[currentImageIndex].description && (
                              <p className="text-white/90 text-sm">
                                {displayImages[currentImageIndex].description}
                              </p>
                            )}
                          </div>
                        </motion.div>

                        {/* Thumbnail Navigation */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
                          {displayImages.map((image, index) => (
                            <button
                              key={image.id}
                              onClick={() => goToImage(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                index === currentImageIndex
                                  ? 'border-white scale-110'
                                  : 'border-white/30 hover:border-white/60'
                              }`}
                            >
                              <img
                                src={image.imageUrl}
                                alt={image.title}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
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
