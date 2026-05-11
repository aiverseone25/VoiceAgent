import React from 'react';
import { motion } from 'framer-motion';

export default function VoiceBars({ active = true, color = 'blue', count = 7 }) {
  const colors = {
    blue: ['#28a8ff', '#0e8bf5'],
    teal: ['#2dd4bf', '#0d9488'],
    purple: ['#a78bfa', '#7c3aed'],
  };
  const [c1, c2] = colors[color] || colors.blue;

  return (
    <div className="flex items-center gap-1 h-12">
      {Array.from({ length: count }).map((_, i) => {
        const baseHeight = 8 + Math.sin((i / count) * Math.PI) * 24;
        return (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{
              background: `linear-gradient(to top, ${c1}, ${c2})`,
              height: baseHeight
            }}
            animate={active
              ? { scaleY: [0.3, 1, 0.3], opacity: [0.6, 1, 0.6] }
              : { scaleY: 0.2, opacity: 0.3 }
            }
            transition={{
              duration: 1.2,
              repeat: active ? Infinity : 0,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        );
      })}
    </div>
  );
}
