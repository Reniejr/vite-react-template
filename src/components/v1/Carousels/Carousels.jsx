/* eslint-disable react/prop-types */
import useCarousel from "./hooks/useCarousel";
import PropTypes from "prop-types";
import { Children, cloneElement } from "react";

// Styles
import styles from "./Carousels.module.scss";
import { generateClassesNames } from "../../../styles/utilities";

// Slide Component
export const Slide = ({ children, additionalStyles, ...props }) => {
  const elements = ["carousel-slide"];
  const classes_names = generateClassesNames(elements, styles, additionalStyles);

  return (
    <div className={classes_names["carousel-slide"]} {...props}>
      {children}
    </div>
  );
};

// Slides Component
export const Slides = ({ children, currentIndex, orientation, variant, stackItemLength, size, additionalStyles, ...props }) => {
  const elements = ["carousel-slides", "carousel-slide-group"];
  const classes_names = generateClassesNames(elements, styles, additionalStyles);
  const isVertical = orientation === "vr";
  const isStack = variant === "stack";

  let groupedSlides = [];
  if (isStack) {
    for (let i = 0; i < children.length; i += stackItemLength) {
      groupedSlides.push(children.slice(i, i + stackItemLength));
    }
  } else {
    groupedSlides = children.map((child) => [child]);
  }

  return (
    <div
      className={`${classes_names["carousel-slides"]} ${styles[orientation]} ${styles[size]}`}
      style={
        isVertical ? {
            width: `${groupedSlides.length * 100}%`,
            marginTop: `-${currentIndex * 100}%`,

        } : {
            width: `${groupedSlides.length * 100}%`,
            marginLeft: `-${currentIndex * 100}%`,

        }}
      {...props}
    >
      {groupedSlides.map((group, index) => (
        <div key={index} className={classes_names["carousel-slide-group"]}
            style={{
                width: `${100 / groupedSlides.length}%`
            }}
        >
          {group.map((child, i) => cloneElement(child, { key: i }))}
        </div>
      ))}
    </div>
  );
};

// Navigation Arrows
export const NavigationArrows = ({ prevSlide, nextSlide, additionalStyles, ...props }) => {
  const elements = ["carousel-navigation"];
  const classes_names = generateClassesNames(elements, styles, additionalStyles);

  return (
    <div className={classes_names["carousel-navigation"]} {...props}>
      <button onClick={prevSlide}>&lt;</button>
      <button onClick={nextSlide}>&gt;</button>
    </div>
  );
};

// Pagination Component
export const Pagination = ({ totalSlides, currentIndex, goToSlide, additionalStyles, ...props }) => {
  const elements = ["carousel-pagination"];
  const classes_names = generateClassesNames(elements, styles, additionalStyles);

  return (
    <div className={classes_names["carousel-pagination"]} {...props}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button key={index} className={index === currentIndex ? styles.active : ""} onClick={() => goToSlide(index)} />
      ))}
    </div>
  );
};

// Main Carousel Component
const Carousel = ({
  children,
  motion = "manual",
  interval = 3000,
  loop = true,
  orientation = "hr",
  variant = "single",
  stackItemLength = 1,
  size = "full-width",
  additionalStyles,
  ...props
}) => {
  const elements = ["carousel", "carousel-error", "hr", "vr", "full-width", "padded"];
  const classes_names = generateClassesNames(elements, styles, additionalStyles);

    let slidesComponent = null;
    let navigationArrows = null;
    let pagination = null;

    Children.forEach(children, (child) => {
        if (!child || typeof child !== "object") return;
        if (child?.type === Slides) slidesComponent = child;
        if (child?.type === NavigationArrows) navigationArrows = child;
        if (child?.type === Pagination) pagination = child;
    });

  const totalSlides = slidesComponent ? slidesComponent.props.children.length : 0;

  const { currentIndex, goToSlide, nextSlide, prevSlide } = useCarousel({
    totalSlides,
    autoSlide: motion === "auto",
    motion,
    interval,
    loop,
    stackItemLength,
    variant
  });

  return (
    <div className={`${classes_names["carousel"]} ${styles[orientation]} ${styles[size]}`} {...props}>
      {!slidesComponent ? <div className={classes_names["carousel-error"]}>No slides found</div> : null }
      {slidesComponent ? cloneElement(slidesComponent, { currentIndex, orientation, variant, stackItemLength, size }) : null }
      {navigationArrows ? cloneElement(navigationArrows, { prevSlide, nextSlide }) : null }
      {pagination ? cloneElement(pagination, { totalSlides, currentIndex, goToSlide }) : null }
    </div>
  );
};

// Prop Types
Carousel.propTypes = {
  children: PropTypes.node.isRequired,
  motion: PropTypes.oneOf(["auto", "manual"]),
  interval: PropTypes.number,
  loop: PropTypes.bool,
  orientation: PropTypes.oneOf(["vr", "hr"]),
  variant: PropTypes.oneOf(["stack", "single"]),
  stackItemLength: PropTypes.number,
  size: PropTypes.oneOf(["full-width", "padded"]),
  additionalStyles: PropTypes.object,
};

export default Carousel;
