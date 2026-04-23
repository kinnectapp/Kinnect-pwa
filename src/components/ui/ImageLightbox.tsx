import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
};

export const ImageLightbox: React.FC<Props> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);
  const hasMultipleImages = images.length > 1;

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextIndex = Math.min(Math.max(initialIndex, 0), images.length - 1);
    setActiveIndex(nextIndex);
  }, [images.length, initialIndex, isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (!hasMultipleImages) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === 0 ? images.length - 1 : current - 1,
        );
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === images.length - 1 ? 0 : current + 1,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, images.length, isOpen, onClose]);

  if (!isOpen || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="fixed  inset-0 z-[99999] bg-black/90">
      <button
        type="button"
        aria-label="Close image viewer"
        onClick={onClose}
        className="absolute right-4 top-[calc(env(safe-area-inset-top)+10px)] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
      >
        <X size={20} />
      </button>

      {hasMultipleImages ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
          >
            <ChevronRight size={24} />
          </button>
        </>
      ) : null}

      <button
        type="button"
        aria-label="Close image viewer"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative flex h-full items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <img
          src={images[activeIndex]}
          alt={`Preview ${activeIndex + 1}`}
          className="relative z-[1] max-h-[70vh] max-w-full rounded-[20px] object-contain shadow-2xl"
        />
      </div>

      {hasMultipleImages ? (
        <div className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
          {activeIndex + 1} / {images.length}
        </div>
      ) : null}
    </div>
  );
};
