// src/index.ts
import { startServer } from "./main/server";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

startServer(PORT).catch(console.error);
