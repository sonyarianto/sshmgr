#! /usr/bin/env node

import path from "path";
import fs from "fs";
import {
  intro,
  outro,
  text,
  select,
  isCancel,
  spinner,
  confirm,
} from "@clack/prompts";
import color from "picocolors";
import { spawnSync } from "child_process";
import { readConfig } from "./app/app";
import * as appConfig from "./app/config";
import { mainMenu } from "./app/clack";

const [, , command, ...args] = process.argv;
let dataConfig: any = null;

// function readConfig() {
//   // check if data file exists

//   try {
//     // file exists

//     fs.accessSync(DATA_FILE_PATH, fs.constants.F_OK);
//     config = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf8"));
//     return config;
//   } catch (err) {
//     // file does not exist

//     fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(emptyConfig, null, 2));
//     config = emptyConfig;
//     return config;
//   }
// }

// async function editConnection() {
//   if (config.connections.length === 0) {
//     outro(`No connection found!`);
//     process.exit(0);
//   }

//   // prepare list of connections

//   const connections = config.connections.map((connection: any) => {
//     return {
//       value: connection.ssh_user,
//       label: connection.ssh_user,
//     };
//   });

//   // show list of connections

//   const selectedConnection = await select({
//     message: "Edit connection:",
//     options: connections,
//   });

//   if (isCancel(selectedConnection)) {
//     quit();
//   }

//   // find connection

//   const connection = config.connections.find((connection: any) => {
//     return connection.ssh_user === selectedConnection;
//   });

//   // edit connection

//   const username = await text({
//     message: "Username",
//     placeholder: connection.ssh_user.split("@")[0],
//     initialValue: connection.ssh_user.split("@")[0],
//     validate: (value) => {
//       if (value === "") return "Username cannot be empty";
//     },
//   });

//   if (isCancel(username)) {
//     quit();
//   }

//   const hostname = await text({
//     message: "Hostname",
//     placeholder: connection.ssh_user.split("@")[1].split(":")[0],
//     initialValue: connection.ssh_user.split("@")[1].split(":")[0],
//     validate: (value) => {
//       if (value === "") return "Hostname cannot be empty";
//       if (!isValidHostname(value)) return "Invalid hostname";
//     },
//   });

//   if (isCancel(hostname)) {
//     quit();
//   }

//   const port = await text({
//     message: "Port",
//     placeholder: connection.ssh_user.split("@")[1].split(":")[1],
//     initialValue: connection.ssh_user.split("@")[1].split(":")[1],
//     validate: (value) => {
//       if (isNaN(Number(value))) return "Port must be a number";
//     },
//   });

//   if (isCancel(port)) {
//     quit();
//   }

//   const identityFile = await text({
//     message: "Identity file",
//     placeholder: connection.identity_file,
//     initialValue: connection.identity_file,
//   });

//   if (isCancel(identityFile)) {
//     quit();
//   }

//   // confirm edit

//   const confirmEdit = await confirm({
//     message: `Are you sure you want to edit connection to ${connection.ssh_user}?`,
//   });

//   if (isCancel(confirmEdit)) {
//     quit();
//   }

//   if (!confirmEdit) {
//     outro(`Connection not edited!`);
//     process.exit(0);
//   }

//   // edit connection

//   config.connections = config.connections.map((connection: any) => {
//     if (connection.ssh_user === selectedConnection) {
//       return {
//         ssh_user: `${username as string}@${hostname as string}:${
//           port as string
//         }`,
//         identity_file: identityFile,
//       };
//     }
//   });

//   fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(config, null, 2));

//   outro(`Connection edited!`);
// }

async function main() {
  intro(
    `${color.bgCyan(color.black(` ${appConfig.APP_NAME} `))} v${
      appConfig.APP_VERSION
    }`
  );

  dataConfig = readConfig({
    configFilePath: appConfig.CONFIG_FILE_PATH,
    defaultConfig: appConfig.defaultConfig,
  });

  mainMenu(dataConfig);
}

main();
