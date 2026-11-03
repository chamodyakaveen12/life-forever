import { db, init, json } from "./lib/db.mjs";

export default async (req) => {
  try {
    await init();
    const userId = Number(new URL(req.url).searchParams.get("userId"));
    if (!userId) return json({ success: false, message: "Missing userId" }, 400);

    if (req.method === "GET") {
      const r = await db.execute({ sql: "SELECT data FROM lf_data WHERE user_id = ?", args: [userId] });
      return json({ success: true, data: r.rows[0] ? JSON.parse(r.rows[0].data) : null });
    }
    if (req.method === "POST") {
      const { data } = await req.json();
      await db.execute({
        sql: `INSERT INTO lf_data (user_id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
        args: [userId, JSON.stringify(data)],
      });
      return json({ success: true });
    }
    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    return json({ success: false, message: "Server error: " + err.message }, 500);
  }
};