import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Flag, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { feedback } from "./lib/feedback";
import { Social } from "./lib/wellnessIndex";
import { incrementUnreadCount, markCommunitySeenNow } from "./lib/unreadCommunity";
import ConfirmDialog from "./ConfirmDialog";

export default function SupportRoom({ onRipple }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [reportedMessages, setReportedMessages] = useState(new Set());
  const [showCoachmark, setShowCoachmark] = useState(false);
  const messagesEndRef = useRef(null);
  const boxRef = useRef(null);
  const [ready, setReady] = useState(false);
  const prevMessageIdsRef = useRef(new Set());

  // Edit/Delete state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ open: false, messageId: null });

  // LocalStorage keys
  const LS_COACH = "res:community:coachmark:v1";
  const LS_MUTE = "res:community:mutedUids";
  const LS_RATE = "res:community:lastSendAt";
  const LS_DAYCOUNT = `res:community:sendCount:${new Date().toISOString().slice(0,10)}`;

  // Utility functions
  const getMuted = () => {
    try { return JSON.parse(localStorage.getItem(LS_MUTE) || "[]"); } catch { return []; }
  };

  const setMuted = (arr) => {
    localStorage.setItem(LS_MUTE, JSON.stringify(Array.from(new Set(arr))));
    setMessages(msgs => [...msgs]);
  };

  const lastSendAt = () => +(localStorage.getItem(LS_RATE) || 0);
  const setLastSendAt = (ms) => localStorage.setItem(LS_RATE, String(ms));
  const getDayCount = () => +(localStorage.getItem(LS_DAYCOUNT) || 0);
  const incDayCount = () => localStorage.setItem(LS_DAYCOUNT, String(getDayCount() + 1));

  const linkify = (s) =>
    s.replace(
      /(https?:\/\/[^\s]+)|(^|[\s])((www\.)[^\s]+)/gi,
      (m, a, b, c) => a ? `<a class="underline text-[#2DD4BF] hover:text-[#0D9488]" href="${a}" target="_blank" rel="noreferrer">${a}</a>`
                         : `${b}<a class="underline text-[#2DD4BF] hover:text-[#0D9488]" href="https://${m.trim()}" target="_blank" rel="noreferrer">${m.trim()}</a>`
    );

  // Daily prompts
  const dailyPrompts = [
    "🌞 What's one thing you're grateful for today?",
    "💬 Who made you smile recently?",
    "🌿 What's helping you stay grounded right now?",
    "✨ Share a win — big or small!",
    "💜 What's one kind thing you can say to someone today?",
    "🌙 What helped you stay calm today?",
    "🔆 How can you support someone else's day right now?",
  ];
  const todayPrompt = dailyPrompts[new Date().getDay()];

  // Load user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setReady(true);
      }
    };
    fetchUser();
  }, []);

  // Check for first-time coachmark
  useEffect(() => {
    if (ready && !localStorage.getItem(LS_COACH)) {
      setShowCoachmark(true);
    }
  }, [ready]);

  // Load messages with unread tracking
  const loadMessages = async () => {
    try {
      const fetchedMessages = await base44.entities.CommunityMessage.list("-created_date", 50);
      
      const formattedMessages = fetchedMessages.map(msg => ({
        id: msg.id,
        type: msg.type,
        text: msg.text,
        emoji: msg.emoji,
        uid: msg.created_by,
        displayName: msg.displayName,
        createdAt: new Date(msg.created_date),
        editedAt: msg.editedAt ? new Date(msg.editedAt) : null,
      })).reverse();

      const myEmail = user?.email;
      const prevMessageIds = prevMessageIdsRef.current;

      // Track new messages from others for unread count
      if (myEmail && prevMessageIds.size > 0) {
        const newOtherMessages = formattedMessages.filter(msg =>
          msg.uid !== myEmail &&
          !prevMessageIds.has(msg.id)
        );

        // Increment unread count for each new message
        newOtherMessages.forEach(() => {
          incrementUnreadCount();
        });
      }

      prevMessageIdsRef.current = new Set(formattedMessages.map(m => m.id));
      setMessages(formattedMessages);
      
      setTimeout(() => {
        if (boxRef.current) {
          boxRef.current.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
      // Silently fail - don't show error to user
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    if (!ready || !user) return;

    loadMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);

    return () => clearInterval(interval);
  }, [ready, user]);

  // Mark as seen when component mounts
  useEffect(() => {
    markCommunitySeenNow();
  }, []);

  // Load reported messages from localStorage
  useEffect(() => {
    const reported = JSON.parse(localStorage.getItem('reportedMessages') || '[]');
    setReportedMessages(new Set(reported));
  }, []);

  // Anti-spam guard
  const canSend = () => {
    const now = Date.now();
    if (now - lastSendAt() < 5000) {
      alert("A quick breath… you can send again in a few seconds 💙");
      return false;
    }
    if (getDayCount() >= 20) {
      alert("Daily limit reached (20). Come back tomorrow, or send a DM instead 💬");
      return false;
    }
    return true;
  };

  const afterAnySend = () => {
    markCommunitySeenNow();
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Prompt Engaged");
    }
  };

  const sendMessage = async (type, content) => {
    if (!user || isSending) return;
    if (!canSend()) return;

    setIsSending(true);
    feedback('tap');

    try {
      const messageData = {
        type,
        displayName: user.full_name || user.email.split('@')[0],
      };

      if (type === "text") {
        messageData.text = content;
      } else {
        messageData.emoji = content;
      }

      await base44.entities.CommunityMessage.create(messageData);

      if (type === "text") {
        setNewMessage("");
      }

      setLastSendAt(Date.now());
      incDayCount();
      feedback('success');

      Social.recordSent(null, { type: "community" });
      afterAnySend();

      // Reload messages immediately after sending
      await loadMessages();

    } catch (error) {
      console.error("Error sending message:", error);
      feedback('error');
    } finally {
      setIsSending(false);
    }
  };

  const reportMessage = async (messageId) => {
    if (reportedMessages.has(messageId)) {
      return;
    }

    try {
      feedback('tap');

      setReportedMessages(prev => new Set([...prev, messageId]));

      const reported = JSON.parse(localStorage.getItem('reportedMessages') || '[]');
      reported.push(messageId);
      localStorage.setItem('reportedMessages', JSON.stringify(reported));

      feedback('success');

      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Community Message Reported");
      }

      alert("Thanks. We've noted this for review.");

    } catch (error) {
      console.error("Error reporting message:", error);
      feedback('error');
    }
  };

  const muteUser = (uidToMute) => {
    const muted = getMuted();
    const set = new Set(muted);
    set.add(uidToMute);
    setMuted(Array.from(set));

    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("User Muted (Community)");
    }
  };

  const unmuteAll = () => {
    setMuted([]);
  };

  const handleSendText = () => {
    const text = newMessage.trim();
    if (text && text.length <= 140) {
      sendMessage("text", text);
    }
  };

  const handleSendEmoji = (emoji) => {
    sendMessage("emoji", emoji);
  };

  const handleEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text || "");
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Community Message Edit Started");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleSaveEdit = async (msgId) => {
    const trimmed = editText.trim();
    if (!trimmed || !user) return;

    try {
      await base44.entities.CommunityMessage.update(msgId, {
        text: trimmed.slice(0, 140),
        editedAt: new Date().toISOString(),
      });

      feedback('success');
      setEditingMessageId(null);
      setEditText("");

      // Reload messages
      await loadMessages();

      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Community Message Edited");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      feedback('error');
      alert("Failed to update message. Please try again.");
    }
  };

  const handleDeleteClick = (msgId) => {
    setConfirmDelete({ open: true, messageId: msgId });
  };

  const handleDeleteConfirm = async () => {
    const msgId = confirmDelete.messageId;
    setConfirmDelete({ open: false, messageId: null });

    if (!msgId || !user) return;

    try {
      await base44.entities.CommunityMessage.delete(msgId);

      feedback('delete');

      // Reload messages
      await loadMessages();

      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Community Message Deleted");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      feedback('error');
      alert("Failed to delete message. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#2DD4BF]" />
      </div>
    );
  }

  const muted = getMuted();
  const filtered = messages.filter((m) => !muted.includes(m.uid));
  const QUICK_EMOJIS = ["💜", "🙏", "🌟", "🔥", "💪", "🎉", "😊"];

  return (
    <Card className="bg-[#1A2035]/80 rounded-xl border border-slate-700/50 flex flex-col h-full" role="region" aria-label="Support Circle">
      <div className="flex flex-col flex-1">

        {/* Welcome + Daily Prompt */}
        <div className="p-4 border-b border-slate-700 text-center">
          <p className="text-sm font-medium text-white">💙 Welcome to the Resonifi Support Circle!</p>
          <p className="text-xs text-gray-400 mt-1">
            Share a kind word or emoji to lift someone's day. Be kind, be real, and keep the vibe positive. 🙏🌟
          </p>

          <AnimatePresence mode="wait">
            <motion.p
              key={new Date().toISOString().slice(0,10)}
              className="text-sm font-semibold mt-3 text-[#2DD4BF]"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              aria-live="polite"
            >
              {todayPrompt}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* First-time coachmark */}
        <AnimatePresence>
          {showCoachmark && (
            <motion.div
              className="mx-4 mt-3 rounded-xl border bg-indigo-500/20 text-indigo-200 text-sm px-3 py-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <div className="flex items-start justify-between gap-2">
                <span>Tip: Send a short encouragement or tap an emoji — small kindness goes a long way 💜</span>
                <button
                  className="text-xs underline"
                  onClick={() => {
                    setShowCoachmark(false);
                    localStorage.setItem(LS_COACH, "1");
                  }}
                  aria-label="Dismiss tip"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Emoji Reactions */}
        <div className="border-b border-slate-700 p-3">
          <div className="flex gap-2 flex-wrap justify-center" role="group" aria-label="Quick emoji reactions">
            {QUICK_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleSendEmoji(emoji)}
                disabled={isSending}
                className="text-2xl hover:scale-110 transition-transform"
                aria-label={`Send ${emoji}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Unmute chip */}
        {muted.length > 0 && (
          <div className="flex justify-center py-2">
            <button
              className="text-xs underline text-gray-400 hover:text-white"
              onClick={unmuteAll}
            >
              Unmute all ({muted.length})
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          ref={boxRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] max-h-[500px] flex flex-col"
          role="list"
          aria-label="Community messages"
        >
          {filtered.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-8">
              No messages yet — say hi or send an emoji to start the wave 🌊
            </div>
          )}

          <AnimatePresence>
            {filtered.map((msg) => {
              const isOwnMessage = user && msg.uid === user.email;
              const isEditing = editingMessageId === msg.id;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 rounded-xl max-w-[80%] ${
                    isOwnMessage
                      ? 'bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 self-end'
                      : 'bg-slate-800/50 border border-slate-700/50 self-start'
                  }`}
                  role="listitem"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400">
                        {msg.displayName || "Member"}
                      </span>
                      {isOwnMessage && (
                        <span className="text-xs text-[#2DD4BF]">(you)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {msg.createdAt instanceof Date
                          ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                      {isOwnMessage && !isEditing && msg.type === "text" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(msg)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            aria-label="Edit message"
                          >
                            <Pencil className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(msg.id)}
                            className="p-1 hover:bg-red-900/30 rounded transition-colors"
                            aria-label="Delete message"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={140}
                        rows={2}
                        className="bg-slate-900 border-slate-600 text-white text-sm"
                        placeholder="Edit your message..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-xs rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700 transition-colors"
                        >
                          <X className="w-3 h-3 inline mr-1" />
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          disabled={!editText.trim()}
                          className="px-3 py-1 text-xs rounded-lg bg-[#2DD4BF] text-white hover:bg-[#0D9488] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-3 h-3 inline mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.type === "text" && msg.text && (
                        <p
                          className="text-sm text-gray-200 whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{ __html: linkify(msg.text) }}
                        />
                      )}
                      {msg.type === "emoji" && msg.emoji && (
                        <div className="text-3xl text-center select-none" aria-label={`Emoji ${msg.emoji}`}>
                          {msg.emoji}
                        </div>
                      )}
                      {msg.editedAt && (
                        <p className="text-xs text-gray-500 mt-1 italic">(edited)</p>
                      )}
                    </>
                  )}

                  {!isOwnMessage && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-700/50">
                      <button
                        onClick={() => reportMessage(msg.id)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <Flag className="w-3 h-3 inline mr-1" />
                        Report
                      </button>
                      <button
                        onClick={() => muteUser(msg.uid)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        Mute user
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex gap-2" role="form" aria-label="Send a message to the community">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder="Send a kind word (140 chars)…"
              className="flex-1 bg-[#0F172A] border-slate-700 text-white"
              maxLength={140}
              disabled={isSending}
              aria-label="Community message input"
            />
            <Button
              onClick={handleSendText}
              disabled={!newMessage.trim() || isSending || newMessage.length > 140}
              className="bg-[#2DD4BF] hover:bg-[#0D9488]"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-[11px] text-gray-500">
              Messages here are visible to all Resonifi members 💬
            </p>
            <div className="text-xs text-gray-500">
              {newMessage.length}/140
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete message?"
        body="This action can't be undone. Your message will be permanently removed from the Support Circle."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ open: false, messageId: null })}
      />
    </Card>
  );
}