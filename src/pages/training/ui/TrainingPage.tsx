import { ImageSlider } from '@/shared/ui/image-slider';

export const TrainingPage = () => {
  const images = [
    '/images/training-1.jpg',
    '/images/training-2.jpg', 
    '/images/training-3.jpg'
  ];

  return (
    <div>
      <ImageSlider images={images} />
    </div>
  );
};