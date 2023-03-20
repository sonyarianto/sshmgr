import {
  confirm,
  isCancel,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts";
import { isValidHostname } from "./app";
import fs from "fs";
import * as appConfig from "./config";
import { spawnSync } from "child_process";

export async function mainMenu(config: any) {
  const selectedMenu = await select({
    message: "What do you want to do with SSH connections?",
    initialValue: "list",
    options: [
      { value: "list", label: "List" },
      { value: "add", label: "Add" },
      { value: "edit", label: "Edit" },
      { value: "remove", label: "Remove" },
      { value: "quit", label: "Quit" },
    ],
  });

  if (isCancel(selectedMenu)) {
    quit();
  }

  switch (selectedMenu) {
    case "add":
      addConnection(config);
      break;
    case "list":
      listConnections(config);
      break;
    case "remove":
      removeConnection(config);
      break;
    // case "edit":
    //   editConnection();
    //   break;
    case "quit":
      quit();
      break;
  }
}

function createConnectionOptions(config: any): any {
  if (config.connections.length === 0) {
    outro(`No connections found!`);
    process.exit(0);
  }

  const connections = config.connections.map((connection: any) => {
    return {
      value: connection.ssh_user,
      label: connection.ssh_user,
    };
  });

  return connections;
}

async function showConnectionOptions(connectionOptions: any, title: string) {
  const selectedConnection = await select({
    message: title,
    options: connectionOptions,
  });

  if (isCancel(selectedConnection)) {
    quit();
  }

  return selectedConnection;
}

async function connectToConnection(connection: any) {
  // split hostname and port based on ssh_user, split by :

  const [hostname, port] = connection.ssh_user.split(":");

  // prepare SSH command

  let sshCommand = "";

  if (connection.identity_file) {
    sshCommand = `ssh -i ${connection.identity_file} ${hostname} -p ${port}`;
  } else {
    sshCommand = `ssh ${hostname} -p ${port}`;
  }

  // show spinner

  const loading = spinner();
  loading.start(`Connecting to ${hostname}`);

  // spawn SSH process

  spawnSync(sshCommand, { stdio: "inherit", shell: true });

  // stop spinner

  loading.stop("Connection closed!");
}

async function listConnections(config: any) {
  const connectionOptions = createConnectionOptions(config);
  connectionOptions.unshift({ value: "back", label: "Back" });

  const selectedConnection = await showConnectionOptions(
    connectionOptions,
    "Connect to:"
  );

  if (selectedConnection === "back") {
    mainMenu(config);
    return;
  }

  // find connection

  const connection = config.connections.find((connection: any) => {
    return connection.ssh_user === selectedConnection;
  });

  connectToConnection(connection);
}

async function removeConnection(config: any) {
  const connectionOptions = createConnectionOptions(config);

  const selectedConnection = await showConnectionOptions(
    connectionOptions,
    "Remove connection:"
  );

  // find connection

  const connection = config.connections.find((connection: any) => {
    return connection.ssh_user === selectedConnection;
  });

  // confirm removal

  const confirmRemoval = await confirm({
    message: `Remove connection (${connection.ssh_user})?`,
  });

  if (isCancel(confirmRemoval)) {
    quit();
  }

  if (!confirmRemoval) {
    mainMenu(config);
    return;
  }

  // remove connection

  config.connections = config.connections.filter((connection: any) => {
    return connection.ssh_user !== selectedConnection;
  });

  fs.writeFileSync(appConfig.CONFIG_FILE_PATH, JSON.stringify(config, null, 2));

  outro(`Connection removed!`);
}

async function addConnection(config: any) {
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

  fs.writeFileSync(appConfig.CONFIG_FILE_PATH, JSON.stringify(config, null, 2));

  outro(`Connection added!`);
}

export function quit() {
  outro(`🙏 Thank you for using ${appConfig.APP_NAME}!`);
  process.exit(0);
}
