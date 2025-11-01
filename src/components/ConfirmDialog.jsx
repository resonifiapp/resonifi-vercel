import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDialog({ open, title = "Confirm", body, confirmText = "Delete", cancelText = "Cancel", onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "Escape") onCancel?.();
      if (e.key.toLowerCase() === "y" && e.ctrlKey) onConfirm?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          role="dialog"
          aria-modal="true"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#1A2035] border border-slate-700 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
            {body && <p className="text-gray-300 text-sm leading-relaxed mb-6">{body}</p>}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}