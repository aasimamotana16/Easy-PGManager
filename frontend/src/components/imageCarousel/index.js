// src/components/imageCarousel/index.js
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";

const slides = [
  { type: "image", src: "/images/loginImages/img10.jpg", alt: "PG Room" },
  { type: "image", src: "/images/loginImages/img4.jpg", alt: "Second Slide" },
];

const ImageCarousel1 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = slides[currentIndex];

  return (
    <Box
      component="div"
      className="w-[140%] h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center bg-background-default transition-all duration-500 ease-in-out rounded-lg shadow-md overflow-hidden"
    >
      <Box
        component="img"
        src={currentSlide.src}
        alt={currentSlide.alt}
        className="w-[120%] h-full object-cover object-center block"
      />
    </Box>
  );
};

export default ImageCarousel1;