import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rowCount: res.rowCount });
    return res;
};

const getClient = async () => {
    const client = await pool.connect();
    const _query = client.query;
    const release = client.release;

    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5s.');
        console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);

    client.query = (...args) => {
        client.lastQuery = args;
        return _query.apply(client, args);
    };

    client.release = () => {
        clearTimeout(timeout);
        client.release = release;
        return release.apply(client);
    };

    return client;
};

export { query, getClient };