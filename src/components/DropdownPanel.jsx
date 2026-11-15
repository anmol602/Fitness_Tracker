import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const MARGIN = 12;

/**
 * Anchored dropdown jo body me portal hota hai.
 * Is se parent ke `overflow: hidden` se cut nahi hota aur
 * position hamesha viewport ke andar clamp rehti hai.
 */
export default function DropdownPanel({
  open,
  anchorRef,
  onClose,
  maxWidth = 288,
  theme = "dark",
  className = "",
  children
}) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const anchor = anchorRef.current;

      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const width = Math.min(maxWidth, window.innerWidth - MARGIN * 2);
      const left = Math.min(
        Math.max(rect.right - width, MARGIN),
        window.innerWidth - MARGIN - width
      );

      const spaceBelow = window.innerHeight - rect.bottom - MARGIN * 2;
      const spaceAbove = rect.top - MARGIN * 2;
      const openUp = spaceBelow < 320 && spaceAbove > spaceBelow;

      setPosition({
        left,
        width,
        top: openUp ? undefined : rect.bottom + MARGIN,
        bottom: openUp ? window.innerHeight - rect.top + MARGIN : undefined,
        maxHeight: Math.max(openUp ? spaceAbove : spaceBelow, 200)
      });
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef, maxWidth]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (anchorRef.current?.contains(event.target)) return;
      if (panelRef.current?.contains(event.target)) return;

      onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, anchorRef, onClose]);

  if (!open || !position) return null;

  return createPortal(
    <motion.div
      ref={panelRef}
      role="dialog"
      initial={{ opacity: 0, y: position.bottom === undefined ? -8 : 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      data-theme={theme === "light" ? "light" : "dark"}
      className={`dashboard fixed z-[60] ${className}`}
      style={{
        left: position.left,
        width: position.width,
        top: position.top,
        bottom: position.bottom,
        maxHeight: position.maxHeight,
        ...(theme === "light"
          ? { backgroundColor: "#ffffff", borderColor: "#d9e5ce" }
          : {})
      }}
    >
      {children}
    </motion.div>,
    document.body
  );
}
