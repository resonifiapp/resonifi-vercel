import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { feedback } from "./lib/feedback";

export default function CheckinReminderModal({ isOpen, onClose, type = "cycle" }) {
  const navigate = useNavigate();

  const handleGoToCheckin = () => {
    feedback('nav');
    navigate(createPageUrl("DailyCheckin"));
    onClose();
  };

  const title = type === "cycle" ? "Cycle log saved!" : "Spiritual resonance saved!";
  const message = "Don't forget to complete your daily check-in to track your full Wellness Index™ for today.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A2035] text-white border-blue-900/50">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white font-bold flex items-center justify-center gap-2">
            <Bell className="w-5 h-5 text-[#2E6AFF]" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center p-4">
          <p className="text-gray-300 mb-2">
            {message}
          </p>
          <p className="text-sm text-gray-400">
            Your {type === "cycle" ? "cycle data" : "spiritual responses"} are saved and will be included in your insights.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-700 text-gray-200 hover:bg-gray-800"
          >
            Later
          </Button>
          <Button
            onClick={handleGoToCheckin}
            className="flex-1 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-gray-900"
          >
            Complete Check-in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}