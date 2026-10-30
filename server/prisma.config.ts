import path from "path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Ensure server/.env is loaded regardless of execution cwd
dotenv.config({ path: path.resolve(import.meta.dirname, ".env") });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Supabase CLI migrations use the direct connection (DIRECT_URL)
    url: env("DIRECT_URL"),
  },
});
