// src/pages/CycleTracking.jsx
import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "resonifi_cycle_v1";
const DEFAULT_LENGTH = 28;
const DEFAULT_PERIOD_DAYS = 5;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/* ---------- Plausible helper ---------- */

function track(eventName, props) {
  if (typeof window === "undefined") return;
  try {
    if (window.plausible && typeof window.plausible === "function") {
      window.plausible(eventName, props ? { props } : undefined);
    }
  } catch (err) {
    console.error("Plausible error:", err);
  }
}

/* ---------- Helpers ---------- */

function atMidnight(date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function dateKeyFromYMD(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function loadCycle() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      lastStart: parsed.lastStart || "",
      lastEnd: parsed.lastEnd || "",
      length: Number(parsed.length) || DEFAULT_LENGTH,
      notes: parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {},
    };
  } catch {
    return null;
  }
}

function saveCycle(data) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function computeSummary(lastStartStr, lastEndStr, length) {
  if (!lastStartStr) return null;

  const cycleLen = Number(length) || DEFAULT_LENGTH;
  const start = atMidnight(new Date(`${lastStartStr}T00:00:00`));

  let explicitEnd = null;
  if (lastEndStr) {
    explicitEnd = atMidnight(new Date(`${lastEndStr}T00:00:00`));
  }

  const periodDays = explicitEnd
    ? Math.max(
        1,
        Math.round((explicitEnd.getTime() - start.getTime()) / MS_PER_DAY) + 1
      )
    : DEFAULT_PERIOD_DAYS;

  const lastStart = start;
  const lastEnd = explicitEnd
    ? explicitEnd
    : atMidnight(new Date(start.getTime() + (DEFAULT_PERIOD_DAYS - 1) * MS_PER_DAY));

  const today = atMidnight(new Date());
  const diffFromStart = today.getTime() - start.getTime();

  const dayOfCycle =
    diffFromStart < 0 ? 1 : (Math.floor(diffFromStart / MS_PER_DAY) % cycleLen) + 1;

  const cyclesPassed =
    diffFromStart > 0 ? Math.floor(diffFromStart / (cycleLen * MS_PER_DAY)) : 0;

  let nextStart = atMidnight(
    new Date(start.getTime() + (cyclesPassed + 1) * cycleLen * MS_PER_DAY)
  );
  if (nextStart.getTime() <= today.getTime()) {
    nextStart = atMidnight(new Date(nextStart.getTime() + cycleLen * MS_PER_DAY));
  }
  const nextEnd = atMidnight(
    new Date(nextStart.getTime() + (periodDays - 1) * MS_PER_DAY)
  );

  const ovulation = atMidnight(new Date(nextStart.getTime() - 14 * MS_PER_DAY));
  const fertileStart = atMidnight(new Date(ovulation.getTime() - 4 * MS_PER_DAY));
  const fertileEnd = ovulation;

  const pmsStart = atMidnight(new Date(nextStart.getTime() - 7 * MS_PER_DAY));
  const pmsEnd = atMidnight(new Date(nextStart.getTime() - 1 * MS_PER_DAY));

  return {
    length: cycleLen,
    periodDays,
    dayOfCycle,
    lastStart,
    lastEnd,
    nextStart,
    nextEnd,
    ovulation,
    fertileStart,
    fertileEnd,
    pmsStart,
    pmsEnd,
  };
}

function isInRange(date, start, end) {
  if (!start || !end) return false;
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function buildMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const rows = [];
  let current = 1 - firstWeekday;

  while (current <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if (current < 1 || current > daysInMonth) week.push(null);
      else week.push(current);
      current++;
    }
    rows.push(week);
  }
  return rows;
}

function describeDate(date, summary) {
  if (!summary) {
    return {
      title: "No data yet",
      description:
        "Add your cycle details above to see how specific days fit into your cycle.",
      tags: [],
    };
  }

  const tags = [];
  const pieces = [];

  if (isInRange(date, summary.lastStart, summary.lastEnd)) {
    tags.push("last-period");
    pieces.push("This day is part of your last recorded period.");
  }

  if (isInRange(date, summary.nextStart, summary.nextEnd)) {
    tags.push("next-period");
    pieces.push("This day is part of your next expected period.");
  }

  const isFertile =
    isInRange(date, summary.fertileStart, summary.fertileEnd) &&
    !isInRange(date, summary.nextStart, summary.nextEnd);

  if (isFertile) {
    tags.push("fertile");
    pieces.push("This day falls in your estimated fertile window.");
  }

  const isOvulation =
    summary.ovulation &&
    atMidnight(date).getTime() === summary.ovulation.getTime();

  if (isOvulation) {
    tags.push("ovulation");
    pieces.push("This is your estimated ovulation day.");
  }

  const isPms =
    isInRange(date, summary.pmsStart, summary.pmsEnd) &&
    !isInRange(date, summary.nextStart, summary.nextEnd);

  if (isPms) {
    tags.push("pms");
    pieces.push("This day is in your estimated PMS window.");
  }

  if (!tags.length) {
    pieces.push("This day is not in a predicted window.");
  }

  return {
    title: "Day details",
    description: pieces.join(" "),
    tags,
  };
}

/* ---------- Calendar Component ---------- */

function MonthCalendar({ year, month, summary, selectedDateKey, onDayClick }) {
  const label = new Date(year, month, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const weeks = buildMonthMatrix(year, month);

  return (
    <div
      style={{
        background: "#020617",
        borderRadius: "1.1rem",
        padding: "0.75rem",
        border: "1px solid rgba(148,163,184,0.35)",
      }}
    >
      <div
        style={{
          fontSize: "0.9rem",
          fontWeight: 500,
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          fontSize: "0.7rem",
          opacity: 0.7,
          marginBottom: "0.25rem",
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} style={{ textAlign: "center" }}>
            {d}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "0.25rem",
          fontSize: "0.8rem",
        }}
      >
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return <div key={`${wi}-${di}`} />;

            const key = dateKeyFromYMD(year, month, day);
            const date = atMidnight(new Date(`${key}T00:00:00`));

            const isLast =
              summary && isInRange(date, summary.lastStart, summary.lastEnd);
            const isNext =
              summary && isInRange(date, summary.nextStart, summary.nextEnd);
            const isFertile =
              summary &&
              isInRange(date, summary.fertileStart, summary.fertileEnd) &&
              !isNext;
            const isOvulation =
              summary &&
              summary.ovulation &&
              date.getTime() === summary.ovulation.getTime();
            const isPms =
              summary &&
              isInRange(date, summary.pmsStart, summary.pmsEnd) &&
              !isNext;

            const isSelected = selectedDateKey === key;

            let bg = "rgba(15,23,42,0.9)";
            let border = "transparent";
            let color = "#e5e7eb";
            let extraShadow = "none";

            if (isLast) {
              bg =
                "linear-gradient(135deg, rgba(45,212,191,0.9), rgba(6,182,212,0.95))";
              border = "rgba(34,211,238,0.85)";
              color = "#0f172a";
            } else if (isNext) {
              bg =
                "linear-gradient(135deg, rgba(129,140,248,0.9), rgba(168,85,247,0.95))";
              border = "rgba(191,219,254,0.9)";
              color = "#020617";
            } else if (isOvulation) {
              bg = "radial-gradient(circle at 30% 20%, #facc15, #f97316 70%)";
              border = "rgba(253,224,71,0.9)";
              color = "#0f172a";
            } else if (isFertile) {
              bg =
                "linear-gradient(135deg, rgba(56,189,248,0.9), rgba(59,130,246,0.95))";
              border = "rgba(191,219,254,0.9)";
            } else if (isPms) {
              bg =
                "linear-gradient(135deg, rgba(248,113,113,0.9), rgba(244,114,182,0.9))";
              border = "rgba(254,202,202,0.9)";
            }

            if (isSelected) {
              extraShadow = "0 0 0 2px rgba(248,250,252,0.7)";
            }

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                onClick={() => onDayClick && onDayClick(key)}
                style={{
                  height: "1.7rem",
                  borderRadius: "0.55rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: bg,
                  border: `1px solid ${border}`,
                  color,
                  boxShadow: extraShadow,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {day}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */

export default function CycleTracking() {
  const [lastStart, setLastStart] = useState("");
  const [lastEnd, setLastEnd] = useState("");
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [notes, setNotes] = useState({});
  const [status, setStatus] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedInfo, setSelectedInfo] = useState(null);

  useEffect(() => {
    const saved = loadCycle();
    if (saved) {
      setLastStart(saved.lastStart);
      setLastEnd(saved.lastEnd);
      setLength(saved.length);
      setNotes(saved.notes || {});
    }
  }, []);

  // Plausible: view event
  useEffect(() => {
    track("CycleTracking Viewed");
  }, []);

  const summary = useMemo(
    () => computeSummary(lastStart, lastEnd, length),
    [lastStart, lastEnd, length]
  );

  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth();
  const nextMonthDate = new Date(thisYear, thisMonth + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth();

  const nextPeriodText = summary ? formatDate(summary.nextStart) : "";

  function persistCycle(updatedNotes = notes) {
    saveCycle({
      lastStart,
      lastEnd,
      length,
      notes: updatedNotes,
    });
  }

  function handleSaveDetails() {
    persistCycle(notes);
    track("Cycle Details Saved", {
      hasLastStart: Boolean(lastStart),
      hasLastEnd: Boolean(lastEnd),
    });
    setStatus("Saved ✓");
    setTimeout(() => setStatus(""), 2000);
  }

  function handleDayClick(dateKey) {
    setSelectedDateKey(dateKey);
    track("Cycle Day Selected", { dateKey });

    if (!summary) {
      setSelectedInfo(describeDate(new Date(`${dateKey}T00:00:00`), null));
      return;
    }
    const d = new Date(`${dateKey}T00:00:00`);
    setSelectedInfo(describeDate(d, summary));
  }

  const selectedDate = selectedDateKey
    ? new Date(`${selectedDateKey}T00:00:00`)
    : null;
  const selectedNote =
    selectedDateKey && notes[selectedDateKey] ? notes[selectedDateKey] : "";

  function handleNoteChange(e) {
    const value = e.target.value;
    if (!selectedDateKey) return;
    setNotes((prev) => {
      const next = { ...prev, [selectedDateKey]: value };
      persistCycle(next);
      return next;
    });
  }

  const upcoming = useMemo(() => {
    if (!summary) return [];
    const list = [];
    for (let i = 0; i < 6; i++) {
      const start = atMidnight(
        new Date(summary.nextStart.getTime() + i * summary.length * MS_PER_DAY)
      );
      const end = atMidnight(
        new Date(start.getTime() + (summary.periodDays - 1) * MS_PER_DAY)
      );
      list.push({ start, end });
    }
    return list;
  }, [summary]);

  return (
    <main
      style={{
        padding: "1.5rem 1rem 5rem",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "1.6rem",
          fontWeight: 600,
          marginBottom: "0.25rem",
        }}
      >
        Cycle tracking
      </h1>

      <p
        style={{
          color: "#f472b6",
          fontSize: "0.82rem",
          marginTop: "0.1rem",
          marginBottom: "0.9rem",
          fontWeight: 500,
        }}
      >
        Resonifi Wellness Inc.™ is a Canadian company. Your reproductive and
        cycle data is stored only on this device and is never sent, saved, or shared.
      </p>

      <p
        style={{
          fontSize: "0.95rem",
          marginBottom: "0.35rem",
        }}
      >
        {summary ? (
          <>
            Next expected period: <strong>{nextPeriodText}</strong>
          </>
        ) : (
          "Add your last period dates below to see your next expected period."
        )}
      </p>

      {summary && (
        <p
          style={{
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: "1.1rem",
          }}
        >
          You are approximately{" "}
          <strong>
            day {summary.dayOfCycle} of {summary.length}
          </strong>{" "}
          in your current cycle.
        </p>
      )}

      <section
        style={{
          background: "#111827",
          borderRadius: "1.5rem",
          padding: "1.25rem 1.25rem 1.4rem",
          boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
          border: "1px solid rgba(148,163,184,0.18)",
          marginBottom: "1.75rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
            gap: "1.5rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.85,
                marginBottom: "0.8rem",
              }}
            >
              Resonifi keeps all of this on your device only.
            </p>

            <div style={{ marginBottom: "0.9rem" }}>
              <label
                htmlFor="cycle-last-start"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  marginBottom: "0.3rem",
                }}
              >
                Last period start date
              </label>
              <input
                id="cycle-last-start"
                type="date"
                value={lastStart}
                onChange={(e) => setLastStart(e.target.value)}
                style={{
                  width: "100%",
                  background: "#020617",
                  color: "#e5e7eb",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.65)",
                  padding: "0.5rem 0.9rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label
                htmlFor="cycle-last-end"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  marginBottom: "0.3rem",
                }}
              >
                Last period end date <span style={{ opacity: 0.6 }}>(optional)</span>
              </label>
              <input
                id="cycle-last-end"
                type="date"
                value={lastEnd}
                onChange={(e) => setLastEnd(e.target.value)}
                style={{
                  width: "100%",
                  background: "#020617",
                  color: "#e5e7eb",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.65)",
                  padding: "0.5rem 0.9rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="cycle-length"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  marginBottom: "0.3rem",
                }}
              >
                Average cycle length (days)
              </label>
              <input
                id="cycle-length"
                type="number"
                min={18}
                max={60}
                value={length}
                onChange={(e) => setLength(e.target.value)}
                style={{
                  width: "100%",
                  background: "#020617",
                  color: "#e5e7eb",
                  borderRadius: "0.6rem",
                  border: "1px solid rgba(148,163,184,0.45)",
                  padding: "0.45rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveDetails}
              style={{
                padding: "0.5rem 1.4rem",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 500,
                background: "linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6)",
                color: "white",
                boxShadow: "0 10px 30px rgba(56,189,248,0.45)",
              }}
            >
              Save cycle details
            </button>

            <div
              style={{
                fontSize: "0.8rem",
                marginTop: "0.45rem",
                opacity: status ? 0.9 : 0.6,
                minHeight: "1em",
              }}
            >
              {status || "Saved securely on this device."}
            </div>
          </div>

          <div
            style={{
              background: "#020617",
              borderRadius: "1.1rem",
              padding: "0.9rem 1rem",
              border: "1px solid rgba(148,163,184,0.35)",
            }}
          >
            <h2
              style={{
                fontSize: "0.95rem",
                marginBottom: "0.5rem",
                fontWeight: 500,
              }}
            >
              Today&apos;s snapshot
            </h2>

            {!summary ? (
              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                Once your dates are set, you'll see where you are in your cycle.
              </p>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    marginBottom: "0.2rem",
                  }}
                >
                  Day {summary.dayOfCycle} of {summary.length}
                </p>

                <p
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "0.35rem",
                    opacity: 0.9,
                  }}
                >
                  Last period:{" "}
                  <strong>
                    {formatDate(summary.lastStart)} – {formatDate(summary.lastEnd)}
                  </strong>
                </p>

                <p
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "0.4rem",
                    opacity: 0.9,
                  }}
                >
                  Next expected period:{" "}
                  <strong>
                    {formatDate(summary.nextStart)} – {formatDate(summary.nextEnd)}
                  </strong>
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("cycle-calendar");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.4rem 1.15rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "transparent",
                    color: "#e5e7eb",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  View calendar details
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="cycle-calendar" style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            marginBottom: "0.4rem",
          }}
        >
          Two-month calendar
        </h2>

        <p
          style={{
            fontSize: "0.85rem",
            opacity: 0.75,
            marginBottom: "0.9rem",
          }}
        >
          Recent period days appear in teal, next period in purple, fertile window
          in blue, PMS in coral, and ovulation in gold.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: "1rem",
          }}
        >
          <MonthCalendar
            year={thisYear}
            month={thisMonth}
            summary={summary}
            selectedDateKey={selectedDateKey}
            onDayClick={handleDayClick}
          />
          <MonthCalendar
            year={nextYear}
            month={nextMonth}
            summary={summary}
            selectedDateKey={selectedDateKey}
            onDayClick={handleDayClick}
          />
        </div>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            marginBottom: "0.4rem",
          }}
        >
          Day details & notes
        </h2>

        {!selectedDateKey ? (
          <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
            Tap any day in the calendar to see where it fits into your cycle.
          </p>
        ) : (
          <div
            style={{
              background: "#020617",
              borderRadius: "1.1rem",
              padding: "0.9rem 1rem 1rem",
              border: "1px solid rgba(148,163,184,0.35)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                opacity: 0.8,
                marginBottom: "0.25rem",
              }}
            >
              Selected date:
            </p>

            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              {formatDate(selectedDate)}
            </p>

            {selectedInfo && (
              <p
                style={{
                  fontSize: "0.85rem",
                  opacity: 0.85,
                  marginBottom: "0.6rem",
                }}
              >
                {selectedInfo.description}
              </p>
            )}

            <label
              htmlFor="cycle-note"
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.3rem",
              }}
            >
              Notes for this day (optional)
            </label>

            <textarea
              id="cycle-note"
              rows={3}
              value={selectedNote}
              onChange={handleNoteChange}
              placeholder="Symptoms, mood, energy..."
              style={{
                width: "100%",
                background: "#020617",
                color: "#f9fafb",
                borderRadius: "0.8rem",
                border: "1px solid rgba(148,163,184,0.5)",
                padding: "0.6rem 0.75rem",
                fontSize: "0.9rem",
                resize: "vertical",
              }}
            />

            <p
              style={{
                fontSize: "0.75rem",
                opacity: 0.6,
                marginTop: "0.35rem",
              }}
            >
              These notes never leave this device.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            marginBottom: "0.4rem",
          }}
        >
          Upcoming cycles (next 6 periods)
        </h2>

        {!summary ? (
          <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
            Once your cycle details are set, you'll see predictions here.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            {upcoming.map((p, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "0.85rem",
                  opacity: 0.9,
                }}
              >
                <strong>Cycle {idx + 1}:</strong> {formatDate(p.start)} –{" "}
                {formatDate(p.end)}
              </li>
            ))}
          </ul>
        )}

        <p
          style={{
            fontSize: "0.75rem",
            opacity: 0.65,
            marginTop: "0.5rem",
          }}
        >
          These dates are estimates and for planning only.
        </p>
      </section>
    </main>
  );
}
