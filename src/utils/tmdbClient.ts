import axios from "axios";
import { env } from "../config/env";

export const tmdbClient = axios.create({
  baseURL: env.tmdbBaseUrl,
  params: {
    api_key: env.tmdbApiKey,
  },
});

export function posterUrl(posterPath: string | null): string | null {
  return posterPath ? `${env.tmdbImageBaseUrl}${posterPath}` : null;
}