import React from "react";
import { motion } from "framer-motion";

export const OrbitIcon = ({ className = "w-9 h-9" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="1" />
        <stop offset="60%" stopColor="var(--color-primary)" stopOpacity="0.6" />
        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="ring1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.9" />
        <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.1" />
        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.6" />
      </linearGradient>

      <linearGradient id="ring2Grad" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
        <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.1" />
        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.8" />
      </linearGradient>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Core Planet */}
    <g transform="translate(50 50)">
      <motion.circle 
        r="14" 
        fill="url(#coreGrad)" 
        filter="url(#coreGlow)"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      />
      <circle r="9" fill="var(--color-accent)" />
      {/* Small highlight on core */}
      <circle cx="-3" cy="-3" r="3" fill="white" opacity="0.3" filter="url(#glow)" />
    </g>

    {/* Ring 1 - Horizontal */}
    <motion.g
      style={{ transformOrigin: "50px 50px" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 14, ease: "linear", repeat: Infinity }}
    >
      <ellipse cx="50" cy="50" rx="42" ry="14" stroke="url(#ring1Grad)" strokeWidth="1.5" fill="none" />
      {/* Orbiting Planet 1 */}
      <circle cx="92" cy="50" r="3.5" fill="var(--color-accent)" filter="url(#glow)" />
      {/* Small trailing dust */}
      <circle cx="85" cy="60" r="1.5" fill="var(--color-accent)" opacity="0.6" />
      <circle cx="78" cy="63" r="1" fill="var(--color-accent)" opacity="0.3" />
    </motion.g>

    {/* Ring 2 - Tilted */}
    <motion.g
      style={{ transformOrigin: "50px 50px" }}
      animate={{ rotate: -360 }}
      transition={{ duration: 22, ease: "linear", repeat: Infinity }}
    >
      <g transform="rotate(60 50 50)">
        <ellipse cx="50" cy="50" rx="35" ry="10" stroke="url(#ring2Grad)" strokeWidth="1" fill="none" />
        {/* Orbiting Planet 2 */}
        <circle cx="15" cy="50" r="2.5" fill="var(--color-primary)" filter="url(#glow)" />
      </g>
    </motion.g>

    {/* Ring 3 - Outer Tilted */}
    <motion.g
      style={{ transformOrigin: "50px 50px" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 30, ease: "linear", repeat: Infinity }}
    >
      <g transform="rotate(-45 50 50)">
        <ellipse cx="50" cy="50" rx="48" ry="16" stroke="url(#ring1Grad)" strokeWidth="0.5" fill="none" opacity="0.6" />
        {/* Orbiting Planet 3 */}
        <circle cx="50" cy="34" r="2" fill="white" filter="url(#glow)" opacity="0.8" />
      </g>
    </motion.g>
  </svg>
);
