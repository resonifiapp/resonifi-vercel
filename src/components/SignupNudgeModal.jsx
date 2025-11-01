import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupNudgeModal({ isOpen, onClose }) {
  const handleSignup = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Guest Signup Nudge Clicked');
    }
    // Redirect to base44 login/signup
    window.location.href = '/login';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 grid place-items-center bg-black/60 backdrop-blur-sm p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A2035] p-6 rounded-2xl max-w-md w-full border border-slate-700/50 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-[#2DD4BF]" />
              <h3 className="text-xl font-semibold text-white">Save your progress?</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Create a free account to keep today's check-in, start a streak, and see insights over time.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSignup}
                className="w-full bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
              >
                Create free account
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-slate-700 text-gray-300 hover:bg-slate-800"
              >
                Not now
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}