const fs = require("fs");
const path = require("path");

const setEnv = () => {
  const writeFile = fs.writeFile;

  const filePath = "./src/environments/environment.ts";
  const dirPath = path.dirname(filePath);

  ensureDirectoryExists(dirPath);

  const envConfigFile = `export const environment = {
  apiKey: '${process.env.API_KEY}',
  openWeatherEndpoint: '${process.env.OPEN_WEATHER_API}',
};
`;
  console.info(
    "The file `environment.ts` will be written with the following content: \n"
  );
  writeFile(filePath, envConfigFile, (err) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.info(
        `Angular environment.ts file generated correctly at ${filePath} \n`
      );
    }
  });
};

setEnv();

function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.info(`Directory created: ${directory}`);
  } else {
    console.info(`Directory already exists: ${directory}`);
  }
}
