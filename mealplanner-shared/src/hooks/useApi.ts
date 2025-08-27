import { useMemo } from "react";
import { createApiClient, FlavorBotApi } from "../api-client/index.js";
import type { PlatformConfig } from "../types/index.js";

// Default configuration for web platform
const defaultWebConfig: PlatformConfig = {
  apiUrl: "http://localhost:5000",
  environment: "development",
  platform: "web",
};

export function useApi(config: Partial<PlatformConfig> = {}) {
  const finalConfig = { ...defaultWebConfig, ...config };
  
  const api = useMemo(() => {
    const client = createApiClient(finalConfig);
    return new FlavorBotApi(client);
  }, [finalConfig.apiUrl, finalConfig.environment, finalConfig.platform]);
  
  return api;
}