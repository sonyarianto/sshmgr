import path from "path";

export const APP_NAME = "sshmgr";
export const APP_VERSION = "0.1.2";
export const CONFIG_FILE_NAME = ".sshmgr.config.json";
export const CONFIG_FILE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  CONFIG_FILE_NAME
);
export const defaultConfig = { connections: [] };
