import fs from "fs";

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

export function isValidHostname(hostname: string) {
  return hostname.match(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
  );
}
