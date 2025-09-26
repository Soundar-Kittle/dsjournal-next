"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const SCROLL_THRESHOLD = 300;
const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    setProgress(scrolled);
    setVisible(scrollTop > SCROLL_THRESHOLD);
    ticking.current = false;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateProgress);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress(); // initial run

    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateProgress]);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:brightness-110 transition cursor-pointer z-[100]"
        >
          {/* Progress Circle */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90 p-1"
            viewBox="0 0 60 60"
          >
            <circle
              cx="30"
              cy="30"
              r={RADIUS}
              stroke="white"
              strokeWidth="3"
              className="opacity-20"
              fill="transparent"
            />
            <circle
              cx="30"
              cy="30"
              r={RADIUS}
              stroke="white"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={
                CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE
              }
              className="transition-all duration-200"
            />
          </svg>

          {/* Icon */}
          <ArrowUp size={20} className="relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
