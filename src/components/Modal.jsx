import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative z-10 w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[#26391C] bg-[#101710] shadow-2xl shadow-black/50"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#26391C] bg-[#101710]/95 backdrop-blur px-5 sm:px-6 py-4">
              <div className="flex items-start gap-3">
                {Icon && (
                  <div className="p-2.5 rounded-xl bg-[#B7FF4A]/10">
                    <Icon className="text-[#B7FF4A]" size={20} />
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold leading-tight">{title}</h2>
                  {description && (
                    <p className="text-gray-400 text-xs mt-1">{description}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-9 h-9 shrink-0 grid place-items-center rounded-xl text-gray-400 hover:text-[#B7FF4A] hover:bg-[#182016] transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
