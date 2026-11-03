import crypto from "node:crypto";
import { db, init, json } from "./lib/db.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ success: false, message: "POST only" }, 405);
  try {
    await init();
    const { email, password } = await req.json();
    if (!email || !password) return json({ success: false, message: "Enter email and password" }, 400);

    const r = await db.execute({
      sql: "SELECT id, name, email, salt, password_hash FROM lf_users WHERE email = ?",
      args: [email.trim().toLowerCase()],
    });
    const u = r.rows[0];
    if (!u) return json({ success: false, message: "Wrong email or password" }, 401);

    const hash = crypto.scryptSync(password, u.salt, 64).toString("hex");
    const ok = crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(u.password_hash, "hex"));
    if (!ok) return json({ success: false, message: "Wrong email or password" }, 401);

    return json({ success: true, user: { id: Number(u.id), name: u.name, email: u.email } });
  } catch (err) {
    return json({ success: false, message: "Server error: " + err.message }, 500);
  }
};