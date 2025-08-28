import { useState, useRef, useEffect, type HTMLAttributes } from 'react';
import clsx from 'clsx';
import { CompactPagination } from '../compact-pagination';
import styles from './ImageSlider.module.scss';

export interface ImageSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  images: string[];
  onChange?: (index: number) => void;
}

export const ImageSlider = ({ 
  images, 
  onChange, 
  className, 
  ...restProps 
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startTouchX = useRef<number>(0);
  const currentTouchX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const goToSlide = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, images.length - 1));
    setCurrentIndex(newIndex);
    onChange?.(newIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startTouchX.current = e.touches[0].clientX;
    currentTouchX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    currentTouchX.current = e.touches[0].clientX;
    const diff = currentTouchX.current - startTouchX.current;
    
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(calc(-${currentIndex * 100}% + ${diff}px))`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    
    const diff = currentTouchX.current - startTouchX.current;
    const threshold = 50;
    
    if (diff > threshold && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else if (diff < -threshold && currentIndex < images.length - 1) {
      goToSlide(currentIndex + 1);
    }
    
    isDragging.current = false;
    
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startTouchX.current = e.clientX;
    currentTouchX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    currentTouchX.current = e.clientX;
    const diff = currentTouchX.current - startTouchX.current;
    
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(calc(-${currentIndex * 100}% + ${diff}px))`;
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    
    const diff = currentTouchX.current - startTouchX.current;
    const threshold = 50;
    
    if (diff > threshold && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else if (diff < -threshold && currentIndex < images.length - 1) {
      goToSlide(currentIndex + 1);
    }
    
    isDragging.current = false;
    
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  if (!images.length) return null;

  return (
    <div className={clsx(styles.wrapper, className)} {...restProps}>
      <div 
        className={styles.slider}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          ref={sliderRef}
          className={styles.track}
        >
          {images.map((image, index) => (
            <div key={index} className={styles.slide}>
              <img 
                src={image} 
                alt={`Slide ${index + 1}`}
                className={styles.image}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      
      {images.length > 1 && (
        <div className={styles.pagination}>
          <CompactPagination>
            {images.map((_, index) => (
              <CompactPagination.Item
                key={index}
                selected={index === currentIndex}
                onClick={() => goToSlide(index)}
              >
                Slide {index + 1}
              </CompactPagination.Item>
            ))}
          </CompactPagination>
        </div>
      )}
    </div>
  );
};