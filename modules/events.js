'use strict';
const superagent = require('superagent');
const errorMessage = require('../lib/errormessage');

let eventFinder = (locationObject, response) => {
  let url = `http://api.eventful.com/json/events/search?location=${locationObject.search_query}&app_key=${process.env.EVENTFUL_API_KEY}`;

  superagent.get(url)
    .then(results => {
      let eventsArr = JSON.parse(results.text).events.event;
      const finalEventsArr = eventsArr.map(event => new Event(event));

      response.send(finalEventsArr);
    })
    .catch(error => {
      console.error(error);
      response.status(500).send(errorMessage);
    });

  function Event(eventData) {
    this.link = eventData.url;
    this.name = eventData.title;
    // eslint-disable-next-line camelcase
    this.event_date = eventData.start_time;
    this.summary = eventData.description;
  }
};

module.exports = eventFinder;
