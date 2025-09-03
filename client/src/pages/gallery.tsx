import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Calendar, MapPin } from "lucide-react";

interface GalleryImage {
  id: string;
  eventId: string;
  title: string;
  imageUrl: string;
  description?: string;
  isMainImage: boolean;
  displayOrder: number;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  mainGalleryImage?: GalleryImage;
  galleryImages?: GalleryImage[];
}

export default function Gallery() {
  const galleryRef = useScrollAnimation();
  
  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["/api/events"],
    queryFn: () => apiRequest<Event[]>("/api/events", "GET"),
  });

  // Handle keyboard events and body scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCarouselOpen) {
        closeCarousel();
      }
    };
    if (isCarouselOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [isCarouselOpen]);



  // Fallback events if database is empty or loading
  const fallbackEvents = [
    {
      id: "fallback-1",
      title: "Tech Workshop 2023",
      description: "A comprehensive workshop covering modern web development technologies",
      date: "2023-10-15",
      location: "Main Auditorium",
      mainGalleryImage: {
        id: "fallback-img-1",
        eventId: "fallback-1",
        title: "Workshop Session",
        imageUrl: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
        description: "Students coding in programming session",
        isMainImage: true,
        displayOrder: 0,
        createdAt: "2023-10-15T10:00:00Z"
      },
      galleryImages: [
        {
          id: "fallback-img-1",
          eventId: "fallback-1",
          title: "Workshop Session",
          imageUrl: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
          description: "Students coding in programming session",
          isMainImage: true,
          displayOrder: 0,
          createdAt: "2023-10-15T10:00:00Z"
        },
        {
          id: "fallback-img-2",
          eventId: "fallback-1",
          title: "Team Collaboration",
          imageUrl: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
          description: "Team collaborating on technical project",
          isMainImage: false,
          displayOrder: 1,
          createdAt: "2023-10-15T11:00:00Z"
        }
      ]
    },
    {
      id: "fallback-2",
      title: "Innovation Showcase 2023",
      description: "Showcasing innovative projects and creative solutions",
      date: "2023-11-20",
      location: "Innovation Center",
      mainGalleryImage: {
        id: "fallback-img-3",
        eventId: "fallback-2",
        title: "Innovation Display",
        imageUrl: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
        description: "Innovation showcase with tech displays",
        isMainImage: true,
        displayOrder: 0,
        createdAt: "2023-11-20T14:00:00Z"
      },
      galleryImages: [
        {
          id: "fallback-img-3",
          eventId: "fallback-2",
          title: "Innovation Display",
          imageUrl: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
          description: "Innovation showcase with tech displays",
          isMainImage: true,
          displayOrder: 0,
          createdAt: "2023-11-20T14:00:00Z"
        }
      ]
    }
  ];

  // Filter events that have gallery images
  const displayEvents = events && events.length > 0 
    ? events.filter(event => event.galleryImages && event.galleryImages.length > 0)
    : fallbackEvents;
  


  // Carousel navigation functions
  const openEventGallery = (event: Event) => {
    console.log("Opening event gallery for:", event.title);
    setSelectedEvent(event);
    setCurrentImageIndex(0);
    setIsCarouselOpen(true);
    console.log("Modal should be open now");
  };

  const closeCarousel = () => {
    console.log("Closing carousel...");
    setIsCarouselOpen(false);
    setSelectedEvent(null);
    setCurrentImageIndex(0);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCarouselOpen) {
        closeCarousel();
      }
    };

    if (isCarouselOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCarouselOpen]);

  const nextImage = () => {
    if (selectedEvent?.galleryImages) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedEvent.galleryImages.length);
    }
  };

  const prevImage = () => {
    if (selectedEvent?.galleryImages) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedEvent.galleryImages.length) % selectedEvent.galleryImages.length);
    }
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
            {!isLoading && !error && displayEvents && displayEvents.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-tech text-sm">
                  No events with gallery images found. Add gallery images to events through the admin panel.
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
            ) : displayEvents.length === 0 ? (
              // No events state
              <div className="text-center py-12">
                <p className="text-tech-grey font-tech">No events with gallery images available. Please add gallery images to events through the admin panel.</p>
              </div>
            ) : (
              <>
                {/* Events Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-8">
                  {displayEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="group cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      onClick={() => openEventGallery(event)}
                      data-testid={`gallery-event-${index}`}
                    >
                      <div className="relative overflow-hidden rounded-xl lg:rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                        <img
                          src={event.mainGalleryImage?.imageUrl || event.imageUrl || "https://via.placeholder.com/400x300?text=Event+Image"}
                          alt={event.title}
                          className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 group-hover:blur-sm transition-all duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-tech-dark/80 via-tech-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Event Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-tech font-bold text-lg sm:text-xl mb-2 drop-shadow-lg">{event.title}</h3>
                          <p className="text-white font-tech text-sm mb-3 line-clamp-2 drop-shadow-md">{event.description}</p>
                          
                          {/* Event Details */}
                          <div className="flex items-center gap-4 text-white text-xs font-tech drop-shadow-md">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                          
                          {/* Image Count */}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-white text-xs font-tech drop-shadow-md">
                              {event.galleryImages?.length || 0} photos
                            </span>
                            <button className="px-3 py-1 bg-tech-blue hover:bg-tech-purple text-white text-xs rounded-full transition-colors shadow-lg">
                              View Photos
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Image Expansion Modal */}
                {console.log("Modal state:", isCarouselOpen, "Selected event:", selectedEvent?.title)}
                {isCarouselOpen && createPortal(
                  <div
                    className="fixed inset-0 z-50 bg-black"
                    onClick={closeCarousel}
                  >
                        {/* Close Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeCarousel();
                          }}
                          className="absolute top-4 left-4 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                          aria-label="Close carousel"
                        >
                          <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Event Title */}
                        <div 
                          className="absolute top-4 left-16 right-4 sm:left-4 sm:right-20 bg-black/50 backdrop-blur-sm rounded-lg p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h2 className="text-white font-tech text-xl font-bold">{selectedEvent?.title}</h2>
                          <p className="text-white/80 text-sm font-tech">{selectedEvent?.location} • {new Date(selectedEvent?.date || '').toLocaleDateString()}</p>
                        </div>

                        {/* Main Image Container */}
                        {selectedEvent?.galleryImages && selectedEvent.galleryImages.length > 0 && (
                          <div
                            key={currentImageIndex}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <img
                              src={selectedEvent.galleryImages[currentImageIndex].imageUrl}
                              alt={selectedEvent.galleryImages[currentImageIndex].description || selectedEvent.galleryImages[currentImageIndex].title}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                        
                        {/* Image Info */}
                        {selectedEvent?.galleryImages && selectedEvent.galleryImages.length > 0 && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="max-w-4xl mx-auto">
                              <h3 className="text-white font-tech text-xl font-semibold mb-2">
                                {selectedEvent.galleryImages[currentImageIndex].title}
                              </h3>
                              {selectedEvent.galleryImages[currentImageIndex].description && (
                                <p className="text-white/90 text-base">
                                  {selectedEvent.galleryImages[currentImageIndex].description}
                                </p>
                              )}
                              <div className="flex items-center justify-center mt-4">
                                <span className="text-white/70 text-base">
                                  {currentImageIndex + 1} of {selectedEvent.galleryImages.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Thumbnail Navigation */}
                        {selectedEvent?.galleryImages && selectedEvent.galleryImages.length > 1 && (
                          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-4 max-w-[90%] overflow-x-auto px-6 scrollbar-hide">
                            {selectedEvent.galleryImages.map((image, index) => (
                              <button
                                key={image.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToImage(index);
                                }}
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
                        )}
                  </div>,
                  document.body
                )}
              </>
            )}
          </div>


        </div>
      </section>
    </div>
  );
}
