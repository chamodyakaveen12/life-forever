import { createClient } from "@libsql/client";
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { email, password } = await req.json();

  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ? AND password = ?",
      args: [email, password]
    });
    if (result.rows.length === 0) return Response.json({ success: false, message: "Invalid login" }, { status: 401 });
    
    return Response.json({ success: true, user: result.rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}