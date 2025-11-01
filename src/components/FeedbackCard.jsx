import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function FeedbackCard() {
  const mailto = "mailto:jp@resonifiapp.com?subject=Resonifi%20Feedback&body=Quick%20note:%0A%0A(What%20confused%20you%3F%20What%20felt%20great%3F)";
  
  const handleClick = () => {
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Feedback Clicked");
    }
  };

  return (
    <Card className="bg-[#1A2035]/80 border-slate-700/50">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#2DD4BF]" />
          <h4 className="text-base font-semibold text-white">Share feedback</h4>
        </div>
        
        <p className="text-sm text-gray-300">
          Help improve Resonifi—two or three lines is perfect.
        </p>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            asChild 
            onClick={handleClick}
            className="bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
          >
            <a href={mailto}>Email jp@resonifiapp.com</a>
          </Button>
          <a
            href={mailto}
            onClick={handleClick}
            className="text-sm underline text-gray-400 hover:text-gray-200 transition"
          >
            Open mail app
          </a>
        </div>
        
        <p className="text-xs text-gray-500">
          Opens your default email app and logs a Plausible event.
        </p>
      </CardContent>
    </Card>
  );
}