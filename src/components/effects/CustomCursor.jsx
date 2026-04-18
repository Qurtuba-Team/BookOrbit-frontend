import React, { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

const CustomCursor = () => {
  const [hoverData, setHoverData] = useState({ active: false, image: "" });
  const [isInteractive, setIsInteractive] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseEnter = (e) => {
      const img = e.currentTarget.getAttribute("data-cursor-image");
      if (img) {
        setHoverData({ active: true, image: img });
      }
      setIsInteractive(true);
    };

    const handleMouseLeave = () => {
      setHoverData({ active: false, image: "" });
      setIsInteractive(false);
    };

    window.addEventListener("mousemove", moveCursor);

    // Initial setup for existing elements
    const updateListeners = () => {
      const elements = document.querySelectorAll("[data-cursor-image], a, button");
      elements.forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
      });
    };

    updateListeners();
    // Observe DOM changes to catch dynamic elements
    const observer = new MutationObserver(updateListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      observer.disconnect();
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* The Lens Cursor */}
      <motion.div
        className={`custom-cursor-lens ${isInteractive ? "cursor-hover" : ""}`}
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          opacity: hoverData.active ? 0 : 1, // Hide lens when image is peeked
        }}
      />

      {/* The Image Peek */}
      <AnimatePresence>
        {hoverData.active && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed z-[99998] pointer-events-none overflow-hidden rounded-xl border-2 border-library-accent/30 shadow-2xl"
            style={{
              left: cursorXSpring,
              top: cursorYSpring,
              width: 150,
              height: 200,
              x: 20, // Offset from cursor
              y: -100,
              backgroundImage: `url(${hoverData.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomCursor;
