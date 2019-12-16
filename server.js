'use strict';

// server build
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const pg = require('pg');
app.use(cors());

// allows us to interact with APIs
const superagent = require('superagent');

const PORT = process.env.PORT || 3001;

// connect to postgres
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));

// error
const errorMessage = {
  status: 500,
  responseText: 'Sorry, something went wrong',
};

// routes
app.get('/', (request, response) => {
  response.status(200).send('Proof of life');
});

app.get('/location', (request, response) => {
  try {
    let city = request.query.data;
    checkDatabaseLocation(city, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

app.get('/weather', (request, response) => {
  try {
    let city = request.query.data;
    dailyWeather(city, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

app.get('/events', (request, response) => {
  try {
    let locationObject = request.query.data;
    eventFinder(locationObject, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

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

// retrieve from APIs
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

// save city to database
let saveToDatabase = (locationOb) => {
  let sql = 'INSERT INTO city_explorer (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)';
  let safeValues = [locationOb.search_query, locationOb.formatted_query, locationOb.latitude, locationOb.longitude];
  client.query(sql, safeValues);
}

let dailyWeather = (city, response) => {
  let latitude = city.latitude;
  let longitude = city.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${latitude},${longitude}`;

  superagent.get(url)
    .then(request => {
      let dailyData = request.body.daily.data;
      let timeSummary = dailyData.map(day => new Forecast(day));
      response.send(timeSummary);
    })
    .catch(error => {
      console.error(error);
      response.status(500).send(errorMessage);
    });

  function Forecast(day) {
    this.forecast = day.summary;
    let date = new Date(day.time * 1000);
    this.time = date.toDateString(); // converts numbers to day
  }
};

let eventFinder = (locationObject, response) => {
  let url = `http://api.eventful.com/json/events/search?location=${locationObject.search_query}&app_key=${process.env.EVENTFUL_API_KEY}`;

  superagent.get(url)
    .then(results => {
      let eventsArr = JSON.parse(results.text).events.event;
      const finalEventsArr = eventsArr.map(event => new Event(event));

      response.send(finalEventsArr);
    });

  function Event(eventData) {
    this.link = eventData.url;
    this.name = eventData.title;
    // eslint-disable-next-line camelcase
    this.event_date = eventData.start_time;
    this.summary = eventData.description;
  }
};

// 404
app.get('*', (request, response) => {
  response.status(404).send('Page not found');
});

// this is a failsafe
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  })
  .catch((error) => console.error(error));
