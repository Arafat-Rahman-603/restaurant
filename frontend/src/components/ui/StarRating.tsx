'use client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, maxStars = 5, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onChange?.(i + 1)}
          className={cn(!interactive && 'pointer-events-none', interactive && 'hover:scale-110 transition-transform')}
        >
          <Star
            className={cn(
              sizeMap[size],
              'transition-colors duration-150',
              i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
            )}
          />
        </button>
      ))}
    </div>
  );
}
