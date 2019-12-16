'use strict';

const superagent = require('superagent');
const errorMessage = require('../lib/errormessage');

let restaurantFinder = (locationObject, response) => {
  let url = `https://api.yelp.com/v3/businesses/search?term=food&latitude=${locationObject.latitude}&longitude=${locationObject.longitude}`;
  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(request => {
      let restaurants = request.body.businesses;
      const restaurantArr = restaurants.map(restaurant => new Restaurant(restaurant));
      response.send(restaurantArr);
    })
    .catch(error => {
      console.error(error);
      response.status(500).send(errorMessage);
    });
  function Restaurant(restaurant) {
    this.name = restaurant.name;
    // eslint-disable-next-line camelcase
    this.image_url = restaurant.image_url;
    this.price = restaurant.price;
    this.rating = restaurant.rating;
    this.url = restaurant.url;
  }
};

module.exports = restaurantFinder;
