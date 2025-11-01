
import React, { useState, useEffect } from "react";
import { JournalEntry } from "@/api/entities";
import { User } from "@/api/entities";
import { BookText, CheckCircle, Save, Calendar, Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { feedback } from "../components/lib/feedback";
import BottomNav from "../components/BottomNav";

export default function DailyJournal() {
  const [entryContent, setEntryContent] = useState("");
  const [todaysEntry, setTodaysEntry] = useState(null);
  const [pastEntries, setPastEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(null);

  useEffect(() => {
    loadJournalEntries();
    
    // Check if script already exists to prevent duplicate injection
    if (document.getElementById('daily-journal-script')) {
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'daily-journal-script'; // Add unique ID
    script.innerHTML = `
      (function() {
        const root = document.documentElement;
        const STORAGE_KEY = "theme";

        function applyTheme(mode) {
          if (mode === "light") {
            root.classList.remove("dark");
          } else if (mode === "dark") {
            root.classList.add("dark");
          } else {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
          }
        }

        function initTheme() {
          const saved = localStorage.getItem(STORAGE_KEY);
          applyTheme(saved);
        }

        window.toggleTheme = function() {
          const saved = localStorage.getItem(STORAGE_KEY);
          let next;
          
          if (saved === null) next = "light";
          else if (saved === "light") next = "dark";
          else next = null;

          if (next) localStorage.setItem(STORAGE_KEY, next);
          else localStorage.removeItem(STORAGE_KEY);

          applyTheme(next);
          
          const newTheme = next === null 
            ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light')
            : next;
          window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
        };

        initTheme();
      })();

      (function() {
        function attachRipple(el) {
          el.addEventListener("click", function (e) {
            const rect = this.getBoundingClientRect();
            const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
            const y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;

            this.style.setProperty("--x", x + "px");
            this.style.setProperty("--y", y + "px");

            this.classList.add("rippling");
            setTimeout(() => this.classList.remove("rippling"), 500);
          }, { passive: true });
        }

        document.querySelectorAll(".ripple").forEach(attachRipple);
        
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                if (node.classList.contains('ripple')) {
                  attachRipple(node);
                }
                node.querySelectorAll && node.querySelectorAll('.ripple').forEach(attachRipple);
              }
            });
          });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
      })();
    `;
    document.head.appendChild(script);

    const handleThemeChange = (e) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChanged', handleThemeChange);

    const initialTheme = localStorage.getItem('theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    setCurrentTheme(initialTheme);

    return () => {
      const scriptElement = document.getElementById('daily-journal-script');
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const loadJournalEntries = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const today = new Date().toISOString().split("T")[0];
      
      const allEntries = await JournalEntry.filter({
        created_by: currentUser.email,
      }, "-date");

      const todayEntry = allEntries.find(entry => entry.date === today);
      setTodaysEntry(todayEntry);
      setEntryContent(todayEntry?.content || "");

      const past = allEntries.filter(entry => entry.date !== today);
      setPastEntries(past);
    } catch (error) {
      console.error("Error loading journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    feedback('save', e?.currentTarget);
    setIsSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      if (todaysEntry) {
        await JournalEntry.update(todaysEntry.id, { content: entryContent });
      } else {
        await JournalEntry.create({ date: today, content: entryContent });
      }
      await loadJournalEntries();
      feedback('success');
    } catch (error) {
      console.error("Error saving journal entry:", error);
      feedback('error', e?.currentTarget);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getThemeIcon = () => {
    if (currentTheme === "light") return <Sun className="w-4 h-4" />;
    if (currentTheme === "dark") return <Moon className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <main className="page--journal">
        <style jsx global>{`
          :root {
            --app-surface: #0F172A;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --app-surface: #0F172A;
            }
          }

          .page--journal {
            background: var(--app-surface) !important;
            min-height: 100vh;
          }

          /* Make header same as app shell */
          .page--journal header,
          .page--journal .page-header {
            background-color: #0F172A !important;
            color: #fff;
            margin: 0;
            width: 100%;
          }
          
          .page--journal header h1,
          .page--journal header p,
          .page--journal header button {
            color: #fff;
          }

          .ripple {
            position: relative;
            overflow: hidden;
            cursor: pointer;
          }
          .ripple::after {
            content: "";
            position: absolute;
            border-radius: 50%;
            width: 100px; height: 100px;
            background: rgba(0, 0, 0, 0.1);
            transform: scale(0);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.4s ease, opacity 0.8s ease;
            top: var(--y, 50%);
            left: var(--x, 50%);
          }
          .dark .ripple::after {
            background: rgba(255, 255, 255, 0.12);
          }
          .ripple.rippling::after {
            transform: scale(3);
            opacity: 1;
          }
          .ripple-success::after {
            background: rgba(52, 199, 89, 0.25) !important;
          }
          .dark .ripple-success::after {
            background: rgba(48, 219, 91, 0.28) !important;
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #2DD4BF;
            border-top: 3px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p className="text-neutral-400">Loading your journal...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page--journal">
      <style jsx global>{`
        :root {
          --app-surface: #0F172A;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --app-surface: #0F172A;
          }
        }

        .page--journal {
          background: var(--app-surface) !important;
          min-height: 100vh;
        }

        /* Make header same as app shell */
        .page--journal header,
        .page--journal .page-header {
          background-color: #0F172A !important;
          color: #fff;
          margin: 0;
          width: 100%;
        }
        
        .page--journal header h1,
        .page--journal header p,
        .page--journal header button {
          color: #fff;
        }

        .ripple {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .ripple::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          width: 100px; height: 100px;
          background: rgba(0, 0, 0, 0.1);
          transform: scale(0);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.4s ease, opacity 0.8s ease;
          top: var(--y, 50%);
          left: var(--x, 50%);
        }
        .dark .ripple::after {
          background: rgba(255, 255, 255, 0.12);
        }
        .ripple.rippling::after {
          transform: scale(3);
          opacity: 1;
        }
        .ripple-success::after {
          background: rgba(52, 199, 89, 0.25) !important;
        }
        .dark .ripple-success::after {
          background: rgba(48, 219, 91, 0.28) !important;
        }
        
        .page-has-bottom-nav {
          padding-bottom: 80px;
        }
        @media (min-width: 768px) {
          .page-has-bottom-nav {
            padding-bottom: 24px;
          }
        }
      `}</style>

      <header className="px-4 py-6 md:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Daily Journal</h1>
          <p className="text-sm text-gray-400">
            A quiet space for your thoughts and reflections.
          </p>
          
          <button 
            className="ripple absolute top-6 right-4 md:right-6 p-2 rounded-full border border-neutral-600 text-white hover:bg-neutral-800 transition"
            onClick={() => window.toggleTheme && window.toggleTheme()}
            title="Toggle theme"
          >
            {getThemeIcon()}
          </button>
        </div>
      </header>

      <div className="px-4 md:px-6 page-has-bottom-nav">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Today's Entry */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6"
          >
            <h2 className="text-xl font-semibold text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-2">
              <BookText size={20} />
              Today's Reflection
            </h2>
            <p className="text-sm italic text-neutral-600 dark:text-neutral-400 mb-4">
              What wave are you riding today?
            </p>
            
            <textarea
              className="w-full min-h-[160px] p-4 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
              value={entryContent}
              onChange={(e) => setEntryContent(e.target.value)}
              placeholder="Share your thoughts, feelings, experiences, or insights from today..."
            />
            <div className="flex justify-end mt-4">
              <button
                className="ripple ripple-success bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2 rounded-full flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: '0', borderWidth: '2px' }}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {todaysEntry ? <CheckCircle size={16} /> : <Save size={16} />}
                    {todaysEntry ? 'Update Entry' : 'Save Entry'}
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Past Entries */}
          {pastEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <h2 className="text-xl font-semibold text-teal-600 dark:text-teal-400 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Past Reflections
              </h2>
              
              <div className="space-y-4">
                {pastEntries.map((entry, index) => (
                  <div key={entry.id}>
                    {index > 0 && <hr className="border-neutral-200 dark:border-neutral-700 my-4" />}
                    <div className="border-l-4 border-teal-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                          {formatDate(entry.date)}
                        </h4>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {getRelativeDate(entry.date)}
                        </span>
                      </div>
                      <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {entry.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {pastEntries.length === 0 && !todaysEntry && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-12 text-center"
            >
              <BookText size={64} className="text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Start Your Journey</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                This is your first journal entry. Write about your day and begin building your personal reflection practice.
              </p>
            </motion.div>
          )}
        </div>
        
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </main>
  );
}
