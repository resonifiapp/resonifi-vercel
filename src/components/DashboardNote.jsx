import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardNote() {
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    // Check local storage flag
    const hasSeenNote = localStorage.getItem("resonifiDashboardNoteSeen");
    if (!hasSeenNote) setShowNote(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem("resonifiDashboardNoteSeen", "true");
    setShowNote(false);
  };

  if (!showNote) return null;

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-none shadow-md mt-4">
      <CardContent className="p-4 space-y-2 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          🌿 A Note from Resonifi
        </h3>
        <p className="text-gray-700 text-sm">
          Thank you for being here and helping Resonifi grow.
        </p>
        <p className="text-gray-700 text-sm">
          We're building a tool for self-awareness — something that helps you
          see patterns, reflect, and feel more connected to yourself each day.
        </p>
        <p className="text-gray-700 text-sm">
          Every time you check in or share feedback, you help us make Resonifi
          even stronger for everyone.
        </p>
        <p className="text-gray-700 text-sm">
          You're part of where this is going — and we're grateful for that. 💫
        </p>
        <Button
          variant="secondary"
          className="mt-3 bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={handleClose}
        >
          Got it
        </Button>
      </CardContent>
    </Card>
  );
}