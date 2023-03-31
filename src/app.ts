import fs from "fs";
import {
  confirm,
  isCancel,
  log,
  outro,
  select,
  text,
} from "@clack/prompts";
import * as appConfig from "./config";
import { spawn } from "child_process";
import color from "picocolors";

let appData: any;

export function readConfig(data: any) {
  try {
    // file exists
    fs.accessSync(data.configFilePath, fs.constants.F_OK);
    return JSON.parse(fs.readFileSync(data.configFilePath, "utf8"));
  } catch (err) {
    // file does not exist
    fs.writeFileSync(
      data.configFilePath,
      JSON.stringify(data.defaultConfig, null, 2)
    );
    return data.defaultConfig;
  }
}

function isValidHostname(hostname: string) {
  return hostname.match(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
  );
}

export async function mainMenu(data: any) {
  appData = data;

  // construct menu options and show menu

  const selectedMenu = await select({
    message: "What do you want to do with SSH connections?",
    initialValue: data.selectedMainMenuValue,
    options: [
      { value: "list", label: "List" },
      { value: "details", label: "Details" },
      { value: "add", label: "Add" },
      { value: "edit", label: "Edit" },
      { value: "remove", label: "Remove" },
      { value: "quit", label: "Quit" },
    ],
  });

  if (isCancel(selectedMenu)) {
    quit();
  }

  // handle menu selection

  switch (selectedMenu) {
    case "add":
      addConnection(appData);
      break;
    case "list":
      listConnections(appData);
      break;
    case "details":
      detailsConnection(appData);
      break;
    case "remove":
      removeConnection(appData);
      break;
    case "edit":
      editConnection(appData);
      break;
    case "quit":
      quit();
      break;
  }
}

function createConnectionOptions(data: any): any {
  if (data.config.connections.length === 0) {
    return false;
  }

  // create connection options

  const connections = data.config.connections.map((connection: any) => {
    let label: string;
    const connectionSymbol = `${connection.identity_file ? "🔑" : "🔒"}`;

    if (connection.name) {
      label = `${connection.name} (${connectionSymbol})`;
    } else {
      label = `${connection.ssh_user} (${connectionSymbol})`;
    }

    return {
      value: connection.ssh_user,
      label: label,
    };
  });

  // sort connections by label ascending, ignore case

  connections.sort((a: any, b: any) => a.label.localeCompare(b.label));

  return connections;
}

async function showConnectionOptions(connectionOptions: any, title: string) {
  const selectedConnectionUri = await select({
    message: title,
    initialValue: appData.selectedConnectionValue
      ? appData.selectedConnectionValue
      : "back",
    options: connectionOptions,
  });

  if (isCancel(selectedConnectionUri)) {
    quit();
  }

  return selectedConnectionUri;
}

async function connectToConnection(connection: any) {
  // split hostname and port based on ssh_user, split by ":" character

  const [hostname, port] = connection.ssh_user.split(":");

  // prepare SSH command

  let sshCommand: string;

  if (connection.identity_file) {
    sshCommand = `ssh -i ${connection.identity_file} ${hostname} -p ${port}`;
  } else {
    sshCommand = `ssh ${hostname} -p ${port}`;
  }

  log.info(`🚀 Connecting to ${hostname}`);

  spawn(sshCommand, { stdio: "inherit", shell: true });
}

async function handleEmptyConnectionOptions(data: any) {
  log.info(`😐 No connections found!`);

  const confirmCreateConnection = await confirm({
    message: `Do you want to create new connection?`,
  });

  if (isCancel(confirmCreateConnection)) {
    quit();
  }

  if (!confirmCreateConnection) {
    mainMenu(data);
    return;
  }

  addConnection(data);
  return;
}

async function listConnections(data: any) {
  appData.selectedMainMenuValue = "list";

  const connectionOptions = await createConnectionOptions(data);

  if (connectionOptions === false) {
    handleEmptyConnectionOptions(data);
    return;
  }

  connectionOptions.unshift({ value: "back", label: "Back" });

  const selectedConnectionUri = await showConnectionOptions(
    connectionOptions,
    "Connect to:"
  );

  if (selectedConnectionUri === "back") {
    mainMenu(data);
    return;
  }

  // find ssh_user in config that matches with selectedConnectionUri

  const connection = data.config.connections.find((connection: any) => {
    return connection.ssh_user === selectedConnectionUri;
  });

  // connect to connection

  connectToConnection(connection);
}

async function detailsConnection(data: any) {
  appData.selectedMainMenuValue = "details";

  const connectionOptions = await createConnectionOptions(data);

  if (connectionOptions === false) {
    handleEmptyConnectionOptions(data);
    return;
  }

  connectionOptions.unshift({ value: "back", label: "Back" });

  const selectedConnectionUri = await showConnectionOptions(
    connectionOptions,
    "See details of:"
  );

  if (selectedConnectionUri === "back") {
    mainMenu(data);
    return;
  }

  // find ssh_user in config that matches with selectedConnectionUri

  const connection = data.config.connections.find((connection: any) => {
    return connection.ssh_user === selectedConnectionUri;
  });

  // connect to connection

  connectionDetails(connection);
}

async function connectionDetails(connection: any) {
  log.info(`Connection URI: ${connection.ssh_user}`);
  log.info(
    `Identity file: ${
      connection.identity_file ? connection.identity_file : "none"
    }`
  );

  const confirmBack = await confirm({
    message: `Back to main menu?`,
  });

  if (isCancel(confirmBack)) {
    quit();
  }

  if (!confirmBack) {
    connectionDetails(connection);
    return;
  }

  mainMenu(appData);
}

async function removeConnection(data: any) {
  appData.selectedMainMenuValue = "remove";

  const connectionOptions = createConnectionOptions(data);

  if (connectionOptions === false) {
    handleEmptyConnectionOptions(data);
    return;
  }

  connectionOptions.unshift({ value: "back", label: "Back" });

  const selectedConnectionUri = await showConnectionOptions(
    connectionOptions,
    "Remove connection:"
  );

  if (selectedConnectionUri === "back") {
    mainMenu(data);
    return;
  }

  // confirm removal

  const confirmRemoval = await confirm({
    message: `Confirm remove?`,
  });

  if (isCancel(confirmRemoval)) {
    quit();
  }

  if (!confirmRemoval) {
    data.selectedConnectionValue = selectedConnectionUri;
    removeConnection(data);
    return;
  }

  // remove connection

  data.config.connections = data.config.connections.filter(
    (connection: any) => {
      return connection.ssh_user !== selectedConnectionUri;
    }
  );

  fs.writeFileSync(
    appConfig.CONFIG_FILE_PATH,
    JSON.stringify(data.config, null, 2)
  );

  log.success(`${color.green(`✓`)} Connection removed!`);

  removeConnection(data);
}

async function addConnection(data: any) {
  appData.selectedMainMenuValue = "add";

  const connectionName = await text({
    message: "Connection name",
    placeholder: "My connection",
    validate: (value) => {
      if (value === "") return "Connection name cannot be empty";

      const connectionExists = data.config.connections.find(
        (connection: any) => {
          return connection.name === value;
        }
      );

      if (connectionExists) return "Connection name already exists";
    },
  });

  if (isCancel(connectionName)) {
    quit();
  }

  const username = await text({
    message: "Username",
    placeholder: "user",
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

  // find connection, is it already added?

  const connectionExists = data.config.connections.find((connection: any) => {
    return connection.ssh_user === sshUser;
  });

  if (connectionExists) {
    outro(`${color.red(`✗`)} Connection already exists!`);
    process.exit(1);
  }

  // add connection

  const connection = {
    name: connectionName,
    ssh_user: sshUser,
    identity_file: identityFile,
  };

  data.config.connections.push(connection);

  fs.writeFileSync(
    appConfig.CONFIG_FILE_PATH,
    JSON.stringify(data.config, null, 2)
  );

  log.success(`${color.green(`✓`)} Connection added!`);

  const confirmBackToMainMenu = await confirm({
    message: `Back to main menu?`,
  });

  if (isCancel(confirmBackToMainMenu)) {
    quit();
  }

  if (!confirmBackToMainMenu) {
    quit();
  }

  mainMenu(data);
}

async function editConnection(data: any) {
  appData.selectedMainMenuValue = "edit";

  const connectionOptions = await createConnectionOptions(data);

  if (connectionOptions === false) {
    handleEmptyConnectionOptions(data);
    return;
  }

  connectionOptions.unshift({ value: "back", label: "Back" });

  const selectedConnectionUri = await showConnectionOptions(
    connectionOptions,
    "Edit connection:"
  );

  if (selectedConnectionUri === "back") {
    mainMenu(data);
    return;
  }

  // find ssh_user in config that matches with selectedConnectionUri

  const connection = data.config.connections.find((connection: any) => {
    return connection.ssh_user === selectedConnectionUri;
  });

  // start editing

  const connectionName = await text({
    message: "Connection name",
    placeholder: connection.name ? connection.name : "My connection",
    initialValue: connection.name ? connection.name : "My connection",
    validate: (value) => {
      if (value === "") return "Connection name cannot be empty";

      const filteredConnections = data.config.connections.filter(
        (connection: any) => {
          return connection.ssh_user !== selectedConnectionUri;
        }
      );

      const connectionExists = filteredConnections.find((connection: any) => {
        return connection.name === value;
      });

      if (connectionExists) return "Connection name already exists";
    },
  });

  if (isCancel(connectionName)) {
    quit();
  }

  const username = await text({
    message: "Username",
    placeholder: connection.ssh_user.split("@")[0],
    initialValue: connection.ssh_user.split("@")[0],
    validate: (value) => {
      if (value === "") return "Username cannot be empty";
    },
  });

  if (isCancel(username)) {
    quit();
  }

  const hostname = await text({
    message: "Hostname",
    placeholder: connection.ssh_user.split("@")[1].split(":")[0],
    initialValue: connection.ssh_user.split("@")[1].split(":")[0],
    validate: (value) => {
      if (value === "") return "Hostname cannot be empty";
      if (!isValidHostname(value)) return "Invalid hostname";
    },
  });

  if (isCancel(hostname)) {
    quit();
  }

  const port = await text({
    message: "Port",
    placeholder: connection.ssh_user.split("@")[1].split(":")[1],
    initialValue: connection.ssh_user.split("@")[1].split(":")[1],
    validate: (value) => {
      if (isNaN(Number(value))) return "Port must be a number";
    },
  });

  if (isCancel(port)) {
    quit();
  }

  const identityFile = await text({
    message: "Identity file",
    placeholder: connection.identity_file
      ? connection.identity_file
      : "~/.ssh/id_rsa",
    initialValue: connection.identity_file ? connection.identity_file : null,
  });

  if (isCancel(identityFile)) {
    quit();
  }

  // confirm edit

  const confirmEdit = await confirm({
    message: `Confirm edit?`,
  });

  if (isCancel(confirmEdit)) {
    quit();
  }

  if (!confirmEdit) {
    data.selectedConnectionValue = selectedConnectionUri;
    editConnection(data);
    return;
  }

  // edit connection

  const index = data.config.connections.findIndex(
    (connection: any) => connection.ssh_user === selectedConnectionUri
  );

  data.config.connections[index] = {
    name: connectionName,
    ssh_user: `${username as string}@${hostname as string}:${port as string}`,
    identity_file: identityFile,
  };

  fs.writeFileSync(
    appConfig.CONFIG_FILE_PATH,
    JSON.stringify(data.config, null, 2)
  );

  outro(`${color.green(`✓`)} Connection edited!`);
}

function quit() {
  outro(
    `🙏 Thank you for using ${color.bgCyan(
      color.black(` ${appConfig.APP_NAME} `)
    )}!`
  );
  process.exit(0);
}
