'use strict';

// server build
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// functions
const checkDatabaseLocation = require('./location/checkdatabase');
const errorMessage = require('./lib/errormessage');
const client = require('./lib/client');
const dailyWeather = require('./modules/weather');
const eventFinder = require('./modules/events');
const movieFinder = require('./modules/movies');
const restaurantFinder = require('./modules/yelp');

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

app.get('/movies', (request, response) => {
  try {
    let locationObject = request.query.data;
    movieFinder(locationObject, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

app.get('/yelp', (request, response) => {
  try {
    let locationObject = request.query.data;
    restaurantFinder(locationObject, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

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
