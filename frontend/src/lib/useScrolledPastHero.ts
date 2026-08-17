import { useEffect, useState } from "react";

/** Full nav appears only after most of the homepage hero has been scrolled. */
export function useScrolledPastHero() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const mark = Math.max(480, window.innerHeight * 0.85);
      setScrolled(window.scrollY > mark);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrolled;
}
