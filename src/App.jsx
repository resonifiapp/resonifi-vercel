import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Resonifi</h1>
      <p>App is rendering from React.</p>
      <p><Link to="/dailycheckin">Go to Daily Check-in →</Link></p>
    </main>
  );
}

function DailyCheckin() {
  return (
    <main style={{ padding: 24 }}>
      <h2>Daily Check-in works ✅</h2>
      <p>Your Resonifi page is rendering successfully.</p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dailycheckin" element={<DailyCheckin />} />
        <Route path="*" element={<Navigate to="/dailycheckin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
