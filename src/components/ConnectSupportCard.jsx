import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCommunityUnread } from "@/components/lib/unreadCommunity";

export default function ConnectSupportCard() {
  // Poll every 10 seconds for new community messages
  const { display, count } = useCommunityUnread(10000);
  
  return (
    <Card className="bg-[#1A2035]/80 border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">💬 Connect & Support</h3>
            {count > 0 && (
              <span
                aria-label={`${count} new community messages`}
                className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold bg-blue-600 text-white animate-pulse"
                title={`${count} new ${count === 1 ? 'message' : 'messages'}`}
              >
                {display}
              </span>
            )}
          </div>
          <Button 
            asChild 
            className="bg-[#2DD4BF] hover:bg-[#0D9488]"
            onClick={() => typeof window !== "undefined" && window.plausible?.("Connect Card Opened")}
          >
            <Link to={createPageUrl("Support")}>
              {count > 0 ? 'View New' : 'Open'}
            </Link>
          </Button>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          {count > 0 
            ? `${count} new ${count === 1 ? 'message' : 'messages'} in the Support Circle` 
            : 'Join the Support Circle or message a friend privately.'}
        </p>
      </CardContent>
    </Card>
  );
}