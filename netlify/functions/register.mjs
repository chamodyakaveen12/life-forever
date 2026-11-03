import crypto from "node:crypto";
import { db, init, json } from "./lib/db.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ success: false, message: "POST only" }, 405);
  try {
    await init();
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return json({ success: false, message: "Fill all fields" }, 400);
    const e = email.trim().toLowerCase();

    const exists = await db.execute({ sql: "SELECT id FROM lf_users WHERE email = ?", args: [e] });
    if (exists.rows.length) return json({ success: false, message: "Email already registered – use Log in" }, 400);

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    const r = await db.execute({
      sql: "INSERT INTO lf_users (name, email, salt, password_hash) VALUES (?, ?, ?, ?)",
      args: [name.trim(), e, salt, hash],
    });
    return json({ success: true, user: { id: Number(r.lastInsertRowid), name: name.trim(), email: e } });
  } catch (err) {
    return json({ success: false, message: "Server error: " + err.message }, 500);
  }
};