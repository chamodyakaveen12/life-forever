import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler() {
  try {
    const result = await db.execute("SELECT 1 AS connected");

    return Response.json({
      success: true,
      message: "Connected to Turso!",
      result: result.rows
    });
  } catch (error) {
    console.error("Turso connection error:", error);

    return Response.json(
      { success: false, message: "Database connection failed" },
      { status: 500 }
    );
  }
}