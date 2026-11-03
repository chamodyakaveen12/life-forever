import { createClient } from "@libsql/client";
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

export default async function handler(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return Response.json({ success: false }, { status: 400 });

  if (req.method === "GET") {
    const result = await db.execute({ sql: "SELECT data FROM user_data WHERE user_id = ?", args: [userId] });
    return Response.json({ success: true, data: JSON.parse(result.rows[0].data) });
  } 
  
  if (req.method === "POST") {
    const { data } = await req.json();
    await db.execute({ sql: "UPDATE user_data SET data = ? WHERE user_id = ?", args: [JSON.stringify(data), userId] });
    return Response.json({ success: true });
  }
}