
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const usePageTransition = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const timeline = gsap.timeline({ delay: 0.1 });
      timeline.fromTo(
        containerRef.current.children,
        {
          y: 30,
          opacity: 0,
          skewX: -10,
          stagger: 0.1,
        },
        {
          duration: 0.8,
          y: 0,
          opacity: 1,
          skewX: 0,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  return containerRef;
};
