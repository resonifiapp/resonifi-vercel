import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HeartHandshake,
  Phone,
  MessageCircle,
  ExternalLink,
  Clock,
  Users,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import SupportResources from "../components/SupportResources";
import SupportRoom from "../components/SupportRoom";
import BottomNav from "../components/BottomNav";
import Meta from "../components/Meta";
import { 
  db, 
  auth, 
  ensureAnonAuth,
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp 
} from "../components/lib/firebase";
import { Social } from "../components/lib/wellnessIndex";
import { markCommunitySeenNow, useCommunityUnread } from "@/components/lib/unreadCommunity";
import { markDMsSeenNow, useDMUnread, incrementDMUnreadCount } from "@/components/lib/unreadDMs";

const QUICK_EMOJIS = ["💜", "🙏", "🌟", "🔥", "💪", "🎉", "😊"];

// Generate a random friend code
function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Friends Panel - Shows your friend code
function FriendsPanel() {
  const [myCode, setMyCode] = useState("");

  useEffect(() => {
    const loadOrCreateCode = async () => {
      await ensureAnonAuth();
      const user = auth.currentUser;
      if (!user) return;

      const storedCode = localStorage.getItem(`friendCode_${user.uid}`);
      if (storedCode) {
        setMyCode(storedCode);
      } else {
        const newCode = generateCode();
        localStorage.setItem(`friendCode_${user.uid}`, newCode);
        setMyCode(newCode);
      }
    };

    loadOrCreateCode();
  }, []);

  const inviteLink = typeof window !== "undefined" && myCode 
    ? `${window.location.origin}/add?code=${myCode}` 
    : "";

  return (
    <Card className="bg-[#1A2035]/80 border-slate-700/50">
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-gray-400">Your Friend Code</div>
        <div className="text-2xl font-bold text-white tracking-wider">
          {myCode || "Loading..."}
        </div>
        {inviteLink && (
          <div className="text-xs text-gray-500 break-all">
            Share: {inviteLink}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add Friend By Code
function AddFriendByCode() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const addByCode = async () => {
    const friendCode = code.trim().toUpperCase();
    if (!friendCode) {
      setMessage("Please enter a code");
      return;
    }

    await ensureAnonAuth();
    const me = auth.currentUser;
    if (!me) return;

    const myCode = localStorage.getItem(`friendCode_${me.uid}`);
    if (friendCode === myCode) {
      setMessage("That's your own code!");
      return;
    }

    const myFriends = JSON.parse(localStorage.getItem(`friends_${me.uid}`) || '[]');
    if (!myFriends.includes(friendCode)) {
      myFriends.push(friendCode);
      localStorage.setItem(`friends_${me.uid}`, JSON.stringify(myFriends));
      setMessage("Friend added! ✓");
      setCode("");
      
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Friend Added");
      }
    } else {
      setMessage("Already friends!");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <Card className="bg-[#1A2035]/80 border-slate-700/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter friend's code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-[#0F172A] border-slate-700 text-white"
          />
          <Button 
            onClick={addByCode}
            className="bg-[#2DD4BF] hover:bg-[#0D9488]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
        {message && (
          <div className="text-sm text-[#2DD4BF]">{message}</div>
        )}
      </CardContent>
    </Card>
  );
}

// Friend List
function FriendList({ onOpenChat }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const loadFriends = async () => {
      await ensureAnonAuth();
      const me = auth.currentUser;
      if (!me) return;

      const friendCodes = JSON.parse(localStorage.getItem(`friends_${me.uid}`) || '[]');
      setFriends(friendCodes);
    };

    loadFriends();
  }, []);

  if (!friends.length) {
    return (
      <Card className="bg-[#1A2035]/80 border-slate-700/50">
        <CardContent className="p-4 text-sm text-gray-400 text-center">
          No friends yet. Add a friend using their code above!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map((code) => {
        const conversationId = [auth.currentUser?.uid, code].sort().join("_");
        return (
          <Card key={code} className="bg-[#1A2035]/80 border-slate-700/50">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="text-sm text-white">Friend: {code}</div>
              <Button
                onClick={() => onOpenChat(conversationId)}
                size="sm"
                className="bg-[#2DD4BF] hover:bg-[#0D9488]"
              >
                Open Chat
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Direct Message Component
function DirectMessage({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const boxRef = useRef(null);
  const me = auth.currentUser;
  const prevMessageIdsRef = useRef(new Set());

  useEffect(() => {
    if (conversationId) {
      markDMsSeenNow();
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      
      const myUid = me?.uid;
      const prevMessageIds = prevMessageIdsRef.current;

      if (myUid && prevMessageIds.size > 0) {
        const newPeerMessages = msgs.filter(msg =>
          msg.senderId !== myUid &&
          !prevMessageIds.has(msg.id)
        );

        newPeerMessages.forEach(() => {
          incrementDMUnreadCount();
        });
      }

      prevMessageIdsRef.current = new Set(msgs.map(m => m.id));
      
      setMessages(msgs);
      
      setTimeout(() => {
        boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
      }, 50);
    });

    return unsubscribe;
  }, [conversationId, me?.uid]);

  const sendMessage = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || !me) return;

    const peerUid = conversationId.split("_").find(x => x !== me.uid) || null;
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    
    await addDoc(messagesRef, {
      senderId: me.uid,
      text: trimmedText.slice(0, 1000),
      emoji: null,
      createdAt: serverTimestamp(),
    });

    setText("");
    
    Social.recordSent(peerUid, { type: "dm" });
    markDMsSeenNow();
    
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("DM Sent");
    }
  };

  const sendEmoji = async (emoji) => {
    if (!me) return;

    const peerUid = conversationId.split("_").find(x => x !== me.uid) || null;
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    
    await addDoc(messagesRef, {
      senderId: me.uid,
      text: null,
      emoji,
      createdAt: serverTimestamp(),
    });
    
    Social.recordSent(peerUid, { type: "dm" });
    markDMsSeenNow();
    
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("DM Emoji Sent", { props: { emoji } });
    }
  };

  if (!conversationId) return null;

  return (
    <Card className="bg-[#1A2035]/80 border-slate-700/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {QUICK_EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="secondary"
              size="sm"
              onClick={() => sendEmoji(emoji)}
              className="text-xl"
            >
              {emoji}
            </Button>
          ))}
        </div>

        <div
          ref={boxRef}
          className="h-64 overflow-y-auto space-y-2 bg-[#0F172A]/50 rounded-lg p-3"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] ${
                msg.senderId === me?.uid ? "ml-auto" : ""
              }`}
            >
              {msg.emoji ? (
                <div className="text-3xl text-center">{msg.emoji}</div>
              ) : (
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    msg.senderId === me?.uid
                      ? "bg-[#2DD4BF] text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Message your friend..."
            className="bg-[#0F172A] border-slate-700 text-white"
          />
          <Button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="bg-[#2DD4BF] hover:bg-[#0D9488]"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Support() {
  const [tab, setTab] = useState("community");
  const [conversationId, setConversationId] = useState(null);
  const [rippleCount, setRippleCount] = useState(0);

  const { count: commCount } = useCommunityUnread();
  const { count: dmCount } = useDMUnread();

  useEffect(() => {
    ensureAnonAuth();
  }, []);

  useEffect(() => {
    if (tab === "community") {
      markCommunitySeenNow();
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Community Seen (Unread Cleared)");
      }
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "friends") {
      markDMsSeenNow();
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("DMs Seen (Unread Cleared)");
      }
    }
  }, [tab]);

  return (
    <>
      <Meta
        title="Resonifi™ — Support"
        description="Connect with the community and get help"
        url="https://resonifiapp.com/support"
      />
      
      <div className="page-has-bottom-nav min-h-screen p-6 bg-[#0F172A] pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
            <p className="text-gray-400">Connect with the community and get help</p>
          </motion.div>

          <div className="flex gap-2 justify-center">
            <div className="relative">
              <Button
                variant={tab === "community" ? "default" : "outline"}
                onClick={() => { 
                  setTab("community"); 
                  if (typeof window !== "undefined" && window.plausible) {
                    window.plausible("Tab Community"); 
                  }
                }}
                className={tab === "community" ? "bg-[#2DD4BF] hover:bg-[#0D9488]" : ""}
              >
                <Users className="w-4 h-4 mr-2" />
                Community
              </Button>
              {commCount > 0 && tab !== "community" && (
                <span
                  className="absolute -top-1 -right-1 inline-block w-2.5 h-2.5 rounded-full bg-blue-600"
                  aria-label={`${commCount} new community messages`}
                  title="New in Community"
                />
              )}
            </div>
            
            <div className="relative">
              <Button
                variant={tab === "friends" ? "default" : "outline"}
                onClick={() => { 
                  setTab("friends"); 
                  if (typeof window !== "undefined" && window.plausible) {
                    window.plausible("Tab Friends"); 
                  }
                }}
                className={tab === "friends" ? "bg-[#2DD4BF] hover:bg-[#0D9488]" : ""}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Friends
              </Button>
              {dmCount > 0 && tab !== "friends" && (
                <span
                  className="absolute -top-1 -right-1 inline-block w-2.5 h-2.5 rounded-full bg-purple-600"
                  aria-label={`${dmCount} new direct messages`}
                  title="New in DMs"
                />
              )}
            </div>
            
            <Button
              variant={tab === "resources" ? "default" : "outline"}
              onClick={() => { 
                setTab("resources"); 
                if (typeof window !== "undefined" && window.plausible) {
                  window.plausible("Tab Resources"); 
                }
              }}
              className={tab === "resources" ? "bg-[#2DD4BF] hover:bg-[#0D9488]" : ""}
            >
              <Phone className="w-4 h-4 mr-2" />
              Resources
            </Button>
          </div>

          {tab === "community" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="bg-[#1A2035]/80 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    Community Support Circle
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    A shared space for encouragement and kind words
                  </p>
                </CardHeader>
                <CardContent>
                  <SupportRoom onRipple={(n) => setRippleCount((prev) => prev + n)} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {tab === "friends" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <FriendsPanel />
              <AddFriendByCode />
              <FriendList onOpenChat={setConversationId} />
              {conversationId && (
                <>
                  <h3 className="text-lg font-semibold text-white">Private Chat</h3>
                  <DirectMessage conversationId={conversationId} />
                </>
              )}
            </motion.div>
          )}

          {tab === "resources" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <SupportResources />
            </motion.div>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
}