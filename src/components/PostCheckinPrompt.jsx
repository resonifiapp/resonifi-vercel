import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function PostCheckinPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onDone = () => {
      setShow(true);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("res:checkin-completed", onDone);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("res:checkin-completed", onDone);
      }
    };
  }, []);

  const close = () => {
    setShow(false);
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Checkin Prompt Dismissed");
    }
  };

  const onGo = () => {
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Checkin Prompt → Support");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-x-0 bottom-5 z-50 px-4"
        >
          <Card className="mx-auto max-w-xl rounded-2xl border-slate-700/50 shadow-lg bg-[#1A2035]">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-white">✨ Nice work on your reflection</h4>
                  <p className="text-sm text-gray-300">
                    Lift someone else's day — share a kind word in the Support Circle.
                  </p>
                </div>
                <button
                  onClick={close}
                  className="text-sm text-gray-400 hover:text-white"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button 
                  asChild 
                  onClick={onGo}
                  className="bg-[#2DD4BF] hover:bg-[#0D9488]"
                >
                  <Link to={createPageUrl("Support")}>Go to Support Circle 💬</Link>
                </Button>
                <Button variant="ghost" onClick={close} className="text-gray-300 hover:text-white">
                  Maybe later
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}