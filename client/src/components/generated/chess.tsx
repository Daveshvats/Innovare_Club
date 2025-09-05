import { memo } from "react";

interface ChessProps {
  className?: string;
}

export const Chess = memo(function Chess({ className = "" }: ChessProps) {
  // Since this is an image URL, display it as an image instead of trying to load as Spline
  const imageUrl = 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?cs=srgb&dl=pexels-pixabay-260024.jpg&fm=jpg';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl w-full h-64 sm:h-80 md:h-96 lg:h-[500px] ${className}`}
    >
      <img
        src={imageUrl}
        alt="Chess event visual"
        className="w-full h-full object-cover rounded-2xl"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '1rem'
        }}
        loading="lazy"
        onError={(e) => {
          console.error('Failed to load Chess image:', imageUrl);
          // Fallback to a placeholder if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
});
