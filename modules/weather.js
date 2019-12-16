'use strict';
const superagent = require('superagent');
const errorMessage = require('../lib/errormessage');

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

module.exports = dailyWeather;
