import "dotenv";

import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema.ts";
import { createClient } from "@libsql/client";

const client = createClient({ url: process.env.DATABASE_URL! });
export const db = drizzle({ client, schema });
