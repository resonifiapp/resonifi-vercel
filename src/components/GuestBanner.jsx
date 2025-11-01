import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function GuestBanner({ onSignup }) {
  return (
    <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white">Save your progress</div>
              <div className="text-xs text-gray-300 mt-0.5">
                Create a free account to keep today's check-in and see trends over time.
              </div>
            </div>
          </div>
          <Button
            onClick={onSignup}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0"
          >
            Sign up free
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}