import { createClient } from "@libsql/client";
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { email, password, name } = await req.json();

  try {
    const id = crypto.randomUUID();
    // Note: In a real app, use bcrypt. For simplicity here, we use basic encoding.
    await db.execute({
      sql: "INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)",
      args: [id, email, password, name]
    });
    // Create empty data for user
    await db.execute({
      sql: "INSERT INTO user_data (user_id, data) VALUES (?, ?)",
      args: [id, JSON.stringify({activities:[],plans:[],logs:[]})]
    });
    return Response.json({ success: true, user: { id, email, name } });
  } catch (err) {
    return Response.json({ success: false, message: "Email already exists" }, { status: 400 });
  }
}