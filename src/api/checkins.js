export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body;
    if (!body || body.type !== "daily-checkin") {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }

    res.status(200).json({
      ok: true,
      receivedAt: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
}
