import "dotenv/config";
import { Pool } from "pg";
import logger from "../utils/logger.js";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Log pool errors
pool.on("error", (err) => {
    logger.error("Unexpected PostgreSQL pool error", {
        error: err.message,
        stack: err.stack
    });
});

const query = async (text, params) => {
    const start = Date.now();

    try {
        const res = await pool.query(text, params);

        const duration = Date.now() - start;

        logger.debug("Database query executed", {
            duration: `${duration}ms`,
            rows: res.rowCount,
            sql:
                process.env.NODE_ENV === "development"
                    ? text
                    : undefined
        });

        return res;

    } catch (error) {

        logger.error("Database query failed", {
            error: error.message,
            duration: `${Date.now() - start}ms`,
            sql:
                process.env.NODE_ENV === "development"
                    ? text
                    : undefined,
            stack: error.stack
        });

        throw error;
    }
};

const getClient = async () => {

    const client = await pool.connect();

    const originalQuery = client.query;
    const originalRelease = client.release;

    const timeout = setTimeout(() => {

        logger.warn(
            "Database client checked out for more than 5 seconds",
            {
                lastQuery:
                    process.env.NODE_ENV === "development"
                        ? client.lastQuery
                        : undefined
            }
        );

    }, 5000);

    client.query = (...args) => {
        client.lastQuery = args[0];
        return originalQuery.apply(client, args);
    };

    client.release = (...args) => {

        clearTimeout(timeout);

        client.query = originalQuery;
        client.release = originalRelease;

        return originalRelease.apply(client, args);
    };

    return client;
};

export { query, getClient, pool };