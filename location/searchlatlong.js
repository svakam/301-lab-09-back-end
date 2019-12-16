'use strict';

const superagent = require('superagent');
const saveToDatabase = require('./savetodatabase');
const errorMessage = require('../lib/errormessage');

let searchLatLong = (city, response) => {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url)
    .then(request => {
      let locationOb = new Location(city, request.body.results[0]);
      response.send(locationOb);
      saveToDatabase(locationOb);
    })
    .catch(error => {
      console.error(error);
      response.status(500).send(errorMessage);
    });

  function Location(city, address) {
    // eslint-disable-next-line camelcase
    this.search_query = city;
    // eslint-disable-next-line camelcase
    this.formatted_query = address.formatted_address;
    this.latitude = address.geometry.location.lat;
    this.longitude = address.geometry.location.lng;
  }
};

module.exports = searchLatLong;
