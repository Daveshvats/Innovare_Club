import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TeamMember {
  name: string;
  position: string;
  Avatar: React.ComponentType<{ className?: string }>;
}

interface TeamCarouselProps {
  teamMembers: TeamMember[];
}

export const TeamCarousel: React.FC<TeamCarouselProps> = ({ teamMembers }) => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={true}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
        className="team-swiper"
      >
        {teamMembers.map((member, index) => {
          const Avatar = member.Avatar;
          return (
            <SwiperSlide key={`${member.name}-${index}`}>
              <motion.div
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full"
                data-testid={`team-member-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                                 {/* Avatar Container - Extra large square aspect ratio */}
                 <div className="relative aspect-square overflow-hidden h-80">
                   <Avatar className="w-full h-full object-cover scale-150" />
                 </div>
                
                {/* Member Info */}
                <div className="p-6 text-center">
                  <h4 className="font-tech font-bold text-tech-dark text-lg mb-2">
                    {member.name}
                  </h4>
                  <p className="text-tech-grey text-sm">
                    {member.position}
                  </p>
                </div>
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white text-tech-dark shadow-lg hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-300 cursor-pointer">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      
      <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white text-tech-dark shadow-lg hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-300 cursor-pointer">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .team-swiper {
          padding: 0 60px;
        }
        
        .swiper-button-prev-custom,
        .swiper-button-next-custom {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
        }
        
        .swiper-button-prev-custom {
          left: 0;
        }
        
        .swiper-button-next-custom {
          right: 0;
        }
        
        .swiper-button-prev-custom.swiper-button-disabled,
        .swiper-button-next-custom.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .swiper-pagination {
          position: relative;
          margin-top: 2rem;
        }
        
        .swiper-pagination-bullet-custom {
          width: 12px;
          height: 12px;
          background: #d1d5db;
          border-radius: 50%;
          opacity: 1;
          margin: 0 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active-custom {
          background: #3b82f6;
          transform: scale(1.2);
        }
        
        .swiper-pagination-bullet-custom:hover {
          background: #9ca3af;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .team-swiper {
            padding: 0 20px;
          }
          
          .swiper-button-prev-custom,
          .swiper-button-next-custom {
            width: 40px;
            height: 40px;
          }
          
          .swiper-button-prev-custom {
            left: -10px;
          }
          
          .swiper-button-next-custom {
            right: -10px;
          }
        }
      `}</style>
    </div>
  );
};
