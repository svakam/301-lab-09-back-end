'use strict';

const pg = require('pg');

// connect to postgres
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));

module.exports = client;
