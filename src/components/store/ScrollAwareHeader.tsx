"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ScrollAwareHeader({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const directionStartY = useRef(0);
  const direction = useRef<"up" | "down" | null>(null);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    directionStartY.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = Math.max(window.scrollY, 0);
      const distance = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 12) {
        setHidden(false);
      } else if (distance > 0) {
        if (direction.current !== "down") {
          direction.current = "down";
          directionStartY.current = currentScrollY;
        }
        if (currentScrollY - directionStartY.current > 12) setHidden(true);
      } else if (distance < 0) {
        if (direction.current !== "up") {
          direction.current = "up";
          directionStartY.current = currentScrollY;
        }
        if (directionStartY.current - currentScrollY > 8) setHidden(false);
      }

      if (distance > 80) {
        setHidden(true);
      } else if (distance < -80) {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-line bg-white shadow-[0_5px_16px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out will-change-transform lg:translate-y-0 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {children}
    </header>
  );
}
