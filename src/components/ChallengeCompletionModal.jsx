import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, X } from 'lucide-react';

export default function ChallengeCompletionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md w-full"
        >
          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, x: 0, opacity: 1 }}
                animate={{
                  y: [0, -200, -400],
                  x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 300],
                  opacity: [1, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#2DD4BF', '#0D9488', '#FFD700', '#FF6B9D'][i % 4]
                }}
              />
            ))}
          </div>

          <Card className="bg-gradient-to-br from-[#1A2035] to-[#0F172A] border-[#2DD4BF]/50 overflow-hidden">
            <div className="relative p-8 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] mb-6"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-3"
              >
                Challenge Complete! 🎉
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 mb-6"
              >
                You completed 7 days of check-ins in a row! You've earned a special badge and proven your commitment to wellness.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Badge Unlocked: 7-Day Warrior</span>
              </motion.div>

              <Button
                onClick={onClose}
                className="w-full bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
              >
                Awesome!
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}