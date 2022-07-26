import "dotenv/config";
import AppDataSource from "./data-source";
import initializeServer from "./server";

AppDataSource.initialize()
  .then(async () => {
    const { start } = initializeServer();

    start();
  })
  .catch((error) => console.log(error));
