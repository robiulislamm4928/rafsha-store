import { useEffect, useCallback } from "react";

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#fbbf24", "#f59e0b"];

const SparkleEffect = () => {
  const createParticle = useCallback((x: number, y: number) => {
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      const size = Math.random() * 8 + 4;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = 30 + Math.random() * 40;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;

      Object.assign(particle.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        backgroundColor: color,
        pointerEvents: "none",
        zIndex: "99999",
        opacity: "1",
        transform: "translate(-50%, -50%) scale(1)",
        transition: "none",
      });

      document.body.appendChild(particle);

      const startTime = performance.now();
      const duration = 500 + Math.random() * 300;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        const currentX = x + dx * eased;
        const currentY = y + dy * eased + 20 * eased * eased;
        const scale = 1 - progress * 0.8;
        const opacity = 1 - progress;

        particle.style.left = `${currentX}px`;
        particle.style.top = `${currentY}px`;
        particle.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${eased * 360}deg)`;
        particle.style.opacity = `${opacity}`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };

      requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    const interactiveSelectors = "button, a, [role='button'], input[type='submit'], .brand-gradient";

    const handlePointerEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      createParticle(x, y);
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(interactiveSelectors);
      if (target) {
        createParticle(e.clientX, e.clientY);
      }
    };

    // Use event delegation for hover
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(interactiveSelectors);
      if (target && !(target as any).__sparkled) {
        (target as any).__sparkled = true;
        const rect = target.getBoundingClientRect();
        createParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
        setTimeout(() => { (target as any).__sparkled = false; }, 800);
      }
    };

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const target = (e.target as HTMLElement)?.closest?.(interactiveSelectors);
      if (target) {
        createParticle(touch.clientX, touch.clientY);
      }
    };

    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("click", handleClick, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [createParticle]);

  return null;
};

export default SparkleEffect;