import { useEffect } from "react";

const useAutoSlide = ({ motion, autoSlide, interval, nextSlide, variant, stackItemLength }) => {
  useEffect(() => {
    if (motion !== "auto") return;

    const slideHandler = () => {
      if (variant === "stack") {
        nextSlide(stackItemLength); // Move by group size
      } else {
        nextSlide();
      }
    };

    const slider = setInterval(slideHandler, interval);
    return () => clearInterval(slider);
  }, [motion, autoSlide, interval, nextSlide, variant, stackItemLength]);
};

export default useAutoSlide;
