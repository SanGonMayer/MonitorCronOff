import dotenv from "dotenv";
dotenv.config();  

import { initDatabase } from "./lib/db.js";

initDatabase();