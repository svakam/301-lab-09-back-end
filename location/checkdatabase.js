'use strict';

const searchLatLong = require('./searchlatlong');
const client = require('../lib/client');

// function to check database for location
let checkDatabaseLocation = (city, response) => {
  let sql = 'SELECT * FROM city_explorer WHERE search_query = $1';
  const safeValues = [city];

  client.query(sql, safeValues)
    .then(sqlResults => {

      // if location already exists, send location object from DB in the response to client
      if (sqlResults.rows.length) {
        response.status(200).json(sqlResults.rows[0]);
      }
      // if not in database, do the searchlatlong function (go to API, send location object in the response to client), and save in database
      else {
        searchLatLong(city, response);
      }
    })
    .catch(error => console.error(error));
};

module.exports = checkDatabaseLocation;
