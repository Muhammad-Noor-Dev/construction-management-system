const { Pool } = require("pg");
const { AsyncLocalStorage } = require("async_hooks");

const requestContext = new AsyncLocalStorage();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setAuditUser(rawQuery, client) {
  const store = requestContext.getStore();
  const userId = store && store.userId ? String(store.userId) : "";
  await rawQuery.call(client, "SELECT set_config('app.user_id', $1, false)", [userId]);
}

const originalConnect = pool.connect.bind(pool);
pool.connect = async function patchedPoolConnect(...args) {
  const client = await originalConnect(...args);
  const rawQuery = client.query.bind(client);
  client.query = async function patchedClientQuery(...queryArgs) {
    await setAuditUser(rawQuery, client);
    return rawQuery(...queryArgs);
  };
  return client;
};

pool.query = async function patchedPoolQuery(...args) {
  const client = await originalConnect();
  const rawQuery = client.query.bind(client);
  try {
    await setAuditUser(rawQuery, client);
    return await rawQuery(...args);
  } finally {
    client.release();
  }
};

pool.requestContext = requestContext;

module.exports = pool;
