'use client'
import React, { useEffect, useState } from 'react';
import '../../src/styles/hero-carousel.css';

const HeroCarousel = () => {
  const images = [
    '/images/banner1.jpg',
    '/images/banner2.jpg',
    '/images/banner3.jpg'
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          className={`slide ${index === current ? 'active' : ''}`}
          alt={`carousel-${index}`}
        />
      ))}
    </div>
  );
};

export default HeroCarousel;

