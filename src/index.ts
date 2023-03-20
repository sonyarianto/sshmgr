#! /usr/bin/env node

import path from "path";
import fs from "fs";
import { intro, outro } from "@clack/prompts";

const VERSION = "0.1.0";
const [, , command, ...args] = process.argv;
const DATA_FILE_NAME = ".sshmgr.config.json";
const DATA_FILE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  DATA_FILE_NAME
);
const emptyConfig = { connections: [] };
let config: any = null;

function readConfig() {
  // check if data file exists

  try {
    // file exists

    fs.accessSync(DATA_FILE_PATH, fs.constants.F_OK);
    config = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf8"));
    return config;
  } catch (err) {
    // file does not exist

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(emptyConfig, null, 2));
    config = emptyConfig;
    return config;
  }
}

async function main() {
  intro(`sshmgr v${VERSION}`);

  config = readConfig();

  switch (command) {
    case "add":
      console.log("add");
      break;
    case "rm":
      console.log("remove");
      break;
    case "edit":
      console.log("edit");
      break;
    default:
      console.log("default");
      break;
  }

  outro(`Thank you for using sshmgr!`);
}

main();
