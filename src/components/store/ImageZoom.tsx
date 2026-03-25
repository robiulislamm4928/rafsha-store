import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  zoomContainerId?: string;
}

const ImageZoom = ({ src, alt, className = "", zoomContainerId = "image-zoom-result" }: ImageZoomProps) => {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [lensPos, setLensPos] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const LENS_SIZE = 120; // px

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });

    // Lens position (clamped)
    const lensLeft = Math.max(0, Math.min(e.clientX - rect.left - LENS_SIZE / 2, rect.width - LENS_SIZE));
    const lensTop = Math.max(0, Math.min(e.clientY - rect.top - LENS_SIZE / 2, rect.height - LENS_SIZE));
    setLensPos({ left: lensLeft, top: lensTop });
  }, []);

  const zoomContainer = typeof document !== "undefined" ? document.getElementById(zoomContainerId) : null;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      
      {/* Lens indicator on the image */}
      {zoomed && (
        <div
          className="absolute border-2 border-primary/60 bg-primary/10 pointer-events-none rounded-sm z-10 hidden md:block"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: lensPos.left,
            top: lensPos.top,
          }}
        />
      )}

      {/* Side zoom panel via portal — desktop only */}
      {zoomed && zoomContainer && createPortal(
        <div
          className="w-full h-full rounded-xl border border-border shadow-lg hidden md:block"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "250%",
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundRepeat: "no-repeat",
            backgroundColor: "hsl(var(--secondary))",
          }}
        />,
        zoomContainer
      )}

      {/* Mobile: overlay zoom (no side panel) */}
      {zoomed && (
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "200%",
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;
