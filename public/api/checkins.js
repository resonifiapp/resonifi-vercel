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
    if (!body?.type || body?.type !== "daily-checkin") {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }

    return res.status(200).json({
      ok: true,
      receivedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
