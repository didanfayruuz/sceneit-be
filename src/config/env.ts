import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  tmdbApiKey: required("TMDB_API_KEY"),
  tmdbBaseUrl: process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3",
  tmdbImageBaseUrl: process.env.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p/w500"
};