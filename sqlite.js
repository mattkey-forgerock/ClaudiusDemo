import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function openDb() {
  return open({
    filename: path.join(__dirname, "data.db"),
    driver: sqlite3.Database
  });
}
