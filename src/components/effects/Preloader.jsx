import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OrbitIcon } from "../common/OrbitIcon";

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
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          className="mb-8 drop-shadow-2xl flex justify-center items-center"
        >
          <OrbitIcon className="w-28 h-28" />
        </motion.div>
        <div className="pl-counter">{count.toString().padStart(3, "0")}</div>
      </motion.div>
    </div>
  );
};

export default Preloader;
