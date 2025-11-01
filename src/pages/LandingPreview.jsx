import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LandingPreview() {
  const navigate = useNavigate();
  const [scores, setScores] = useState({ phys: 5, emo: 5, soc: 5 });
  const [index, setIndex] = useState(50);

  useEffect(() => {
    // Check if returning user
    if (localStorage.getItem("rf_first_visit")) {
      navigate(createPageUrl("Dashboard"));
      return;
    }
    localStorage.setItem("rf_first_visit", "1");

    // Confetti on load
    createConfetti();

    // Exit intent modal
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !localStorage.getItem("rf_exit_shown")) {
        document.getElementById("exitModal").classList.add("show");
        localStorage.setItem("rf_exit_shown", "1");
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // Idle prompt (30s)
    let idleTimeout = setTimeout(() => {
      if (!localStorage.getItem("rf_idle_shown")) {
        document.getElementById("idleModal").classList.add("show");
        localStorage.setItem("rf_idle_shown", "1");
      }
    }, 30000);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(idleTimeout);
    };
  }, [navigate]);

  useEffect(() => {
    const avg = (scores.phys + scores.emo + scores.soc) / 3;
    setIndex(Math.round(avg * 10));
  }, [scores]);

  const createConfetti = () => {
    const canvas = document.getElementById("confetti");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 4 + 2,
        d: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 360}, 70%, 70%)`,
        tilt: Math.random() * 10 - 5,
        tiltAngleIncrement: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
      });
    }

    let animationFrame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(p.d) + 1 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle) * 2;
        p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

        if (p.y > canvas.height) particles.splice(i, 1);

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
      });

      if (particles.length > 0) animationFrame = requestAnimationFrame(draw);
    };
    draw();

    setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);
  };

  const goToSignup = () => {
    navigate(createPageUrl("Onboarding"));
  };

  const goToLogin = () => {
    navigate(createPageUrl("Dashboard"));
  };

  const closeModal = (id) => {
    document.getElementById(id).classList.remove("show");
  };

  return (
    <>
      <style>{`
        :root{--navy:#0b1c33;--navy-700:#0e2645;--white:#fff;--accent:#7ad1ff;--shadow:0 10px 30px rgba(0,0,0,.2);--radius:14px}
        *{box-sizing:border-box}
        body{margin:0;background:var(--navy);color:var(--white);font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif}
        .wrap{min-height:100dvh;display:flex;flex-direction:column}
        header{padding:20px 18px 8px;display:flex;align-items:center;justify-content:space-between}
        .brand{display:flex;gap:10px;align-items:center}
        .logo{width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 60% 40%,#fff 0 14%,transparent 15%),conic-gradient(from 180deg,#fff 0 50%,transparent 50% 100%);outline:2px solid rgba(255,255,255,.2);outline-offset:3px}
        .title{font-weight:700;letter-spacing:.2px}
        .ghost{opacity:.85}
        .remember{text-align:left;font-size:1rem;opacity:.75;margin-top:6px;font-style:italic;animation:fadein 4s ease-in 1}
        @keyframes fadein{from{opacity:0}to{opacity:.75}}
        main{flex:1;display:flex;flex-direction:column;gap:16px;padding:12px 18px 96px;max-width:880px;margin:0 auto;width:100%}
        .hero{text-align:center;margin-top:8px;padding:10px 10px 0}
        h1{margin:.25rem 0 0;font-size:1.9rem;line-height:1.15}
        .sub{opacity:.9;margin:.55rem auto 0;max-width:34ch}
        .row{display:grid;gap:14px}
        @media (min-width:720px){ .row{grid-template-columns:1.1fr .9fr} }
        .card{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.14);border-radius:var(--radius);padding:16px 14px;box-shadow:0 1px 0 rgba(255,255,255,.06) inset}
        .card h2{margin:0 0 .4rem;font-size:1.15rem}
        .muted{opacity:.85}
        .index{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 4px 0}
        .score{font-variant-numeric:tabular-nums;font-size:3.2rem;font-weight:800;letter-spacing:.5px;text-shadow:0 0 40px rgba(122,209,255,.25)}
        .glow{animation:glow 2.2s ease-in-out infinite}
        @keyframes glow{0%,100%{text-shadow:0 0 26px rgba(122,209,255,.22)}50%{text-shadow:0 0 46px rgba(122,209,255,.45)}}
        .pillars{display:grid;gap:12px;margin-top:6px}
        .slider{display:grid;grid-template-columns:110px 1fr 46px;align-items:center;gap:10px;padding:10px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
        .slider label{font-weight:600}
        input[type="range"]{width:100%;appearance:none;height:8px;border-radius:8px;background:linear-gradient(90deg,#7ad1ff55,#ffffff22);outline:none}
        input[type="range"]::-webkit-slider-thumb{appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px #7ad1ff55;border:0}
        .val{font-feature-settings:"tnum";font-weight:700}
        .tip{font-size:.9rem;opacity:.85;margin-top:6px}
        .journal-entry{background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.22);padding:12px;border-radius:12px;position:relative}
        .lock{position:absolute;inset:0;border-radius:12px;background:linear-gradient(180deg,rgba(11,28,51,.2),rgba(11,28,51,.55));display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;opacity:0;transition:.25s ease}
        .journal-entry:hover .lock{opacity:1}
        .community{display:grid;gap:10px;margin-top:6px}
        .post{padding:10px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
        .note{opacity:.75;font-size:.9rem;margin-top:8px}
        .footer{opacity:.9;text-align:center;font-size:.9rem;margin:16px auto 84px}
        .links{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border:1px solid rgba(255,255,255,.18);padding:.85rem 1.05rem;border-radius:12px;color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));backdrop-filter:blur(6px);transition:transform .06s ease,border-color .2s ease;cursor:pointer}
        .btn:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.35)}
        .btn.primary{background:linear-gradient(180deg,#2c74ff33,#2c74ff22);border-color:#7ad1ff55}
        .btn.small{padding:.6rem .8rem;border-radius:10px;font-size:.95rem}
        .btn.cta{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:50;box-shadow:var(--shadow)}
        .modal{position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.38);z-index:60;padding:18px}
        .modal.show{display:grid}
        .modal .sheet{width:100%;max-width:520px;background:var(--navy-700);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:18px;box-shadow:var(--shadow)}
        .sheet h3{margin:.1rem 0 .35rem}
        .sheet p{opacity:.9;margin:.25rem 0 1rem}
        .sheet .actions{display:flex;gap:10px;flex-wrap:wrap}
        .sheet .actions .btn{flex:1}
        #confetti{position:fixed;inset:0;pointer-events:none;z-index:40}
        :focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:10px}
      `}</style>

      <div className="wrap">
        <canvas id="confetti" aria-hidden="true"></canvas>

        <header>
          <div className="brand">
            <div className="logo" role="img" aria-label="Resonifi logo"></div>
            <span className="title">Resonifi™</span>
          </div>
          <button onClick={goToLogin} className="btn small ghost" aria-label="Sign in to your account">
            Sign In
          </button>
        </header>

        <main>
          <section className="hero">
            <h1>Track What Truly Matters</h1>
            <p className="sub">
              A no-login preview of your personal Wellness Index — adjust the sliders and feel the resonance.
            </p>
            <p className="remember">
              "We are not alone in our struggles, and we don't have to face them alone."
            </p>
          </section>

          <div className="row">
            <div className="card">
              <h2>Your Wellness Index</h2>
              <p className="muted">Real-time calculation based on your pillars</p>
              <div className="index">
                <div className="score glow" aria-live="polite" aria-atomic="true">
                  {index}
                </div>
                <div style={{ textAlign: "right", opacity: 0.75 }}>
                  <div style={{ fontSize: "0.9rem" }}>out of 100</div>
                  <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                    {index >= 70 ? "Thriving ✨" : index >= 50 ? "Balanced 🌿" : "Needs Care 🫂"}
                  </div>
                </div>
              </div>
              <p className="tip">
                Move the sliders below to see your index update in real time.
              </p>
            </div>

            <div className="card">
              <h2>Core Pillars (Demo)</h2>
              <p className="muted">Adjust these to explore the app's feel</p>
              <div className="pillars">
                <div className="slider">
                  <label htmlFor="phys">Physical</label>
                  <input
                    type="range"
                    id="phys"
                    min="0"
                    max="10"
                    value={scores.phys}
                    onChange={(e) => setScores({ ...scores, phys: parseInt(e.target.value) })}
                    aria-label="Physical wellness score from 0 to 10"
                  />
                  <span className="val">{scores.phys}</span>
                </div>
                <div className="slider">
                  <label htmlFor="emo">Emotional</label>
                  <input
                    type="range"
                    id="emo"
                    min="0"
                    max="10"
                    value={scores.emo}
                    onChange={(e) => setScores({ ...scores, emo: parseInt(e.target.value) })}
                    aria-label="Emotional wellness score from 0 to 10"
                  />
                  <span className="val">{scores.emo}</span>
                </div>
                <div className="slider">
                  <label htmlFor="soc">Social</label>
                  <input
                    type="range"
                    id="soc"
                    min="0"
                    max="10"
                    value={scores.soc}
                    onChange={(e) => setScores({ ...scores, soc: parseInt(e.target.value) })}
                    aria-label="Social wellness score from 0 to 10"
                  />
                  <span className="val">{scores.soc}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="card">
              <h2>📓 Daily Journaling</h2>
              <p className="muted">Reflect, track patterns, and gain insights over time</p>
              <div className="journal-entry">
                <p style={{ margin: 0, opacity: 0.7 }}>
                  "Today I felt grateful for small moments of peace..."
                </p>
                <div className="lock">
                  <div>
                    <div style={{ fontSize: "2rem" }}>🔒</div>
                    <div style={{ marginTop: "8px" }}>Sign up to unlock journaling</div>
                  </div>
                </div>
              </div>
              <p className="note">Your thoughts stay private — only you can see them.</p>
            </div>

            <div className="card">
              <h2>💬 Community Pulse</h2>
              <p className="muted">Anonymous support from others on the same path</p>
              <div className="community">
                <div className="post">
                  <strong>Anonymous</strong> · 2h ago
                  <p style={{ margin: "6px 0 0", opacity: 0.85 }}>
                    "Struggled today but took a walk. Small wins count."
                  </p>
                </div>
                <div className="post">
                  <strong>Anonymous</strong> · 5h ago
                  <p style={{ margin: "6px 0 0", opacity: 0.85 }}>
                    "Reminded myself that progress isn't linear. 🌱"
                  </p>
                </div>
              </div>
              <p className="note">Real stories from real people. You're not alone.</p>
            </div>
          </div>

          <footer className="footer">
            <div className="links">
              <a href="#" className="ghost">Privacy</a>
              <span>·</span>
              <a href="#" className="ghost">Terms</a>
              <span>·</span>
              <a href="#" className="ghost">About</a>
            </div>
            <p style={{ marginTop: "12px", opacity: 0.7 }}>
              © {new Date().getFullYear()} Resonifi™. All rights reserved.
            </p>
          </footer>
        </main>

        <button
          onClick={goToSignup}
          className="btn primary cta"
          aria-label="Create your free Resonifi account"
        >
          ✨ Create My Free Account
        </button>
      </div>

      {/* Exit Intent Modal */}
      <div id="exitModal" className="modal" role="dialog" aria-labelledby="exitTitle" aria-modal="true">
        <div className="sheet">
          <h3 id="exitTitle">Wait — don't go just yet! 🌟</h3>
          <p>You're one step away from tracking what truly matters. Join the pilot and start your journey.</p>
          <div className="actions">
            <button onClick={goToSignup} className="btn primary">
              Join the Pilot
            </button>
            <button onClick={() => closeModal("exitModal")} className="btn ghost">
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      {/* Idle Modal */}
      <div id="idleModal" className="modal" role="dialog" aria-labelledby="idleTitle" aria-modal="true">
        <div className="sheet">
          <h3 id="idleTitle">Still exploring? 👀</h3>
          <p>Ready to make this yours? Sign up and start tracking your wellness in seconds.</p>
          <div className="actions">
            <button onClick={goToSignup} className="btn primary">
              Get Started Free
            </button>
            <button onClick={() => closeModal("idleModal")} className="btn ghost">
              Keep Browsing
            </button>
          </div>
        </div>
      </div>
    </>
  );
}