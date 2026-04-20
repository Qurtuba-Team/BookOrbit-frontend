import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Preloader = ({ onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment + Math.random() * 2;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(onComplete, 500);
      }
      setCount(Math.floor(current));
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="preloader-root">
      {/* Split Overlays */}
      <motion.div
        initial={{ scaleY: 1 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        className="pl-overlay pl-top origin-top"
      />
      <motion.div
        initial={{ scaleY: 1 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        className="pl-overlay pl-bottom origin-bottom"
      />

      <motion.div
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="pl-content"
      >
        <svg className="w-20 h-20 mb-4" viewBox="0 0 100 100" fill="none">
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke="var(--color-accent)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M30 40 L50 30 L70 40 L70 70 L50 60 L30 70 Z"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
          />
        </svg>
        <div className="pl-counter">{count.toString().padStart(3, "0")}</div>
      </motion.div>
    </div>
  );
};

export default Preloader;
