import express, { Router } from "express";
import cors from "cors";
import authRoutes, { verifyToken } from "./routes/auth";

import athleteRoutes from "./routes/athlete";
import companyRoutes from "./routes/company";

export default function initializeServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(authRoutes("/auth"));
  app.use(athleteRoutes("/athlete", verifyToken));
  app.use(companyRoutes("/company", verifyToken));

  const start = () => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  };

  return { start };
}
