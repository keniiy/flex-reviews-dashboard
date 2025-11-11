'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Camera, Star as StarIcon } from 'lucide-react';

interface PhotoGalleryProps {
  propertyName: string;
  photos?: string[];
  rating?: number;
}

export const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
  'https://images.unsplash.com/photo-1515263487990-61b07816b324',
  'https://images.unsplash.com/photo-1465188162913-8fb5709d6d57',
];

export const buildPhotoUrl = (url: string, width = 1600, quality = 80) =>
  `${url}?auto=format&fit=crop&w=${width}&q=${quality}`;

export function PhotoGallery({ propertyName, photos, rating }: PhotoGalleryProps) {
  const galleryPhotos = photos && photos.length > 0 ? photos : FALLBACK_PHOTOS;
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const heroPhoto = galleryPhotos[selectedPhoto] ?? galleryPhotos[0];
  const totalPhotos = galleryPhotos.length;
  const displayRating = useMemo(() => rating ?? 4.6, [rating]);

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="relative lg:col-span-2 h-[320px] sm:h-[400px] lg:h-[520px] overflow-hidden rounded-2xl">
        <Image
          src={buildPhotoUrl(heroPhoto)}
          alt={`${propertyName} primary photo`}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
          priority
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge className="bg-accent-red border-none text-white px-4 py-1 rounded-full text-xs uppercase tracking-wide">
            All listings
          </Badge>
          <span className="bg-white/85 text-gray-900 px-4 py-1.5 rounded-full text-sm font-semibold shadow">
            Flex Living · Verified stay
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-brand-primary text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
            {displayRating.toFixed(2)}
            <StarIcon className="w-4 h-4 fill-white text-white" />
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
          <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-sm">
            {selectedPhoto + 1} / {totalPhotos}
          </div>
          <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
            <Camera className="w-4 h-4" />
            Gallery
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
        {galleryPhotos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            onClick={() => setSelectedPhoto(index)}
            className={`relative h-32 sm:h-36 rounded-xl overflow-hidden border transition-all hover:opacity-90 ${
              selectedPhoto === index ? 'border-brand-primary ring-2 ring-brand-primary/40' : 'border-transparent'
            }`}
            aria-label={`View photo ${index + 1}`}
          >
            <Image
              src={buildPhotoUrl(photo, 800)}
              alt={`${propertyName} photo ${index + 1}`}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
            <div className="absolute top-2 right-2 bg-black/45 text-white text-xs px-2 py-0.5 rounded-full">
              {index + 1}
            </div>
            {index === totalPhotos - 1 && totalPhotos > 6 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-semibold gap-2">
                <Camera className="w-4 h-4" />
                + {totalPhotos - index - 1} photos
              </div>
            )}
            {selectedPhoto === index && (
              <div className="absolute inset-0 border-4 border-white/70 rounded-xl pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
