"use client";

import { motion } from "framer-motion";

const BRANDS = [
  { name: "Netflix", src: "/img/netflix.png" },
  { name: "Spotify", src: "/img/spotify.png" },
  { name: "Youtube", src: "/img/youtube.jpeg" },
  { name: "Canva", src: "/img/canva.webp" },
  { name: "ChatGPT", src: "/img/chatgpt.jpeg" },
  { name: "Adobe", src: "/img/adobe.png" },
  { name: "Claude", src: "/img/claude.jpeg" },
  { name: "CapCut", src: "/img/capcut.jpg" },
  { name: "Gemini", src: "/img/gemini.jpg" },
  { name: "Grok", src: "/img/grok.svg" },
  { name: "Cursor", src: "/img/cursor.png" },
  { name: "DeepSeek", src: "/img/deepseek.png" },
  { name: "Discord", src: "/img/discord.avif" },
  { name: "Duolingo", src: "/img/duolingo.png" },
];

export function BrandTicker() {
  // Triple the list to ensure seamless transition on all screen sizes
  const tickerItems = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <div className="w-full py-2 md:py-4 overflow-hidden relative group">
      {/* Gradient Masks - reduced width and optimized for performance */}
      <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex items-center gap-12 md:gap-20 whitespace-nowrap"
        animate={{
          x: [0, -1000], 
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {tickerItems.map((brand, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex items-center justify-center filter grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default"
          >
            <img
              src={brand.src}
              alt={brand.name}
              className="h-8 md:h-10 w-auto object-contain max-w-[120px]"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
