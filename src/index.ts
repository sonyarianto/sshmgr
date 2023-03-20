#! /usr/bin/env node

import path from "path";
import fs from "fs";
import { intro, outro, text, select } from "@clack/prompts";
import color from "picocolors";

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
  intro(`${color.bgCyan(color.black(" sshmgr "))} v${VERSION}`);

  config = readConfig();

  const selectedMenu = select({
    message: "What do you want to do?",
    initialValue: "list",
    options: [
      { value: "list", label: "List connections" },
      { value: "add", label: "Add connection" },
      { value: "edit", label: "Edit connection" },
      { value: "rm", label: "Remove connection" },
      { value: "quit", label: "Quit" },
    ],
  });

  switch (await selectedMenu) {
    case "quit":
      outro(`Thank you for using sshmgr!`);
      break;
  }
}

main();
