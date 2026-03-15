import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  APP_URL: process.env.APP_URL || "http://localhost:5173",
};