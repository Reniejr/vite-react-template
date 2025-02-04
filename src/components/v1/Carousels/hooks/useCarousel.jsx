import { useState } from "react";
import useAutoSlide from "./useAutoSlide";

const useCarousel = ({ totalSlides, autoSlide, motion, interval, loop, variant, stackItemLength }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate the maximum index based on variant
  const maxIndex = variant === "stack" 
    ? Math.ceil(totalSlides / stackItemLength) - 1 
    : totalSlides - 1;

  const goToSlide = (index) => {
    if (!loop) {
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    } else {
      setCurrentIndex((index + maxIndex + 1) % (maxIndex + 1)); 
    }
  };

  const nextSlide = () => goToSlide(currentIndex + 1);
  const prevSlide = () => goToSlide(currentIndex - 1);

  useAutoSlide({ motion, autoSlide, interval, nextSlide });

  return { currentIndex, goToSlide, nextSlide, prevSlide };
};

export default useCarousel;
