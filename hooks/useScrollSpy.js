"use client";

import { useEffect, useState } from "react";

export default function useScrollSpy(selector = "h2, h3") {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll(selector));

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-120px 0px -60% 0px", // ajusté à ton layout
        threshold: 0,
      }
    );

    headings.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector]);

  return activeId;
}
