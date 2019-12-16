'use strict';

const client = require('../lib/client');

// save city to database
let saveToDatabase = (locationOb) => {
  let sql = 'INSERT INTO city_explorer (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)';
  let safeValues = [locationOb.search_query, locationOb.formatted_query, locationOb.latitude, locationOb.longitude];
  client.query(sql, safeValues);
};

module.exports = saveToDatabase;
