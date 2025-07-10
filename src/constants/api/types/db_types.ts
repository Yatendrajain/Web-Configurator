import db from "@/db/client";

export type DbType = typeof db;
export type TxType = Parameters<Parameters<DbType["transaction"]>[0]>[0];
