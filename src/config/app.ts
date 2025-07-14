// ✅ Required modules
import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// ✅ Your config and logic
import { corsOptions } from "./cors";
import routes from "../routes/routes";
import cleanExpiredOtps from "src/cron/cleanExpiredOtps";
import deleteExpiredUsers from "src/cron/deleteUsersJob";

const app: Application = express();

// ✅ Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ✅ Start the OTP cleanup cron job
cleanExpiredOtps.start();
deleteExpiredUsers.start();

console.log("🕒 Scheduled cron jobs started");

// ✅ Register main routes
app.use("/api", routes);

export default app;
