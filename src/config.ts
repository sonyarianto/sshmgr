import path from "path";
import packageJson from "../package.json";

export const APP_NAME = "sshmgr";
export const APP_VERSION = packageJson.version;
export const CONFIG_FILE_NAME = ".sshmgr.config.json";
export const CONFIG_FILE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  CONFIG_FILE_NAME
);
export const defaultConfig = { connections: [] };
