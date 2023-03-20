#! /usr/bin/env node

import path from "path";
import fs from "fs";
import { intro, outro, text, select, isCancel } from "@clack/prompts";
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

function isValidHostname(hostname: string) {
  return hostname.match(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
  );
}

async function addConnection() {
  const username = await text({
    message: "Username",
    placeholder: "user",
    defaultValue: "user",
    validate: (value) => {
      if (value === "") return "Username cannot be empty";
    },
  });

  if (isCancel(username)) {
    quit();
  }

  const hostname = await text({
    message: "Hostname",
    placeholder: "example.com",
    validate: (value) => {
      if (value === "") return "Hostname cannot be empty";
      if (!isValidHostname(value)) return "Hostname is invalid";
    },
  });

  if (isCancel(hostname)) {
    quit();
  }

  const port = await text({
    message: "Port",
    placeholder: "22",
    defaultValue: "22",
    validate: (value) => {
      if (isNaN(Number(value))) return "Port must be a number";
    },
  });

  if (isCancel(port)) {
    quit();
  }

  const identityFile = await text({
    message: "Identity file",
    placeholder: "~/.ssh/id_rsa",
  });

  if (isCancel(identityFile)) {
    quit();
  }

  const sshUser = `${username as string}@${hostname as string}:${
    port as string
  }`;

  const connection = {
    ssh_user: sshUser,
    identity_file: identityFile,
  };

  config.connections.push(connection);

  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(config, null, 2));

  outro(`Connection added!`);
}

function quit() {
  outro(`Thank you for using sshmgr!`);
  process.exit(0);
}

async function main() {
  intro(`${color.bgCyan(color.black(" sshmgr "))} v${VERSION}`);

  config = readConfig();

  const selectedMenu = await select({
    message: "What do you want to do with SSH connections?",
    initialValue: "list",
    options: [
      { value: "list", label: "List" },
      { value: "add", label: "Add" },
      { value: "edit", label: "Edit" },
      { value: "rm", label: "Remove" },
      { value: "quit", label: "Quit" },
    ],
  });

  if (isCancel(selectedMenu)) {
    quit();
  }

  switch (selectedMenu) {
    case "add":
      addConnection();
      break;
    case "quit":
      quit();
      break;
  }
}

main();
