const setEnv = () => {
  const fs = require("fs");
  const writeFile = fs.writeFile;

  const targetPath = "./src/environments/environment.ts";

  const envConfigFile = `export const environment = {
  apiKey: '${process.env.API_KEY}',
  openWeatherEndpoint: '${process.env.OPEN_WEATHER_API}',
};
`;
  console.log(
    "The file `environment.ts` will be written with the following content: \n"
  );
  writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(
        `Angular environment.ts file generated correctly at ${targetPath} \n`
      );
    }
  });
};

setEnv();
