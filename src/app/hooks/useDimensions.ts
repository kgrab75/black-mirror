import { useState, useEffect } from "react";

export default function useDimensions(ref: React.RefObject<HTMLInputElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setTimeout(() => {
        if (ref.current) {

          const { width, height } = ref.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      }, 100);
    };

    // Initial dimensions update
    updateDimensions();

    // Update dimensions on window resize
    window.addEventListener('resize', updateDimensions);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [ref]);

  return dimensions;
};