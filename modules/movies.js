'use strict';

const superagent = require('superagent');
const errorMessage = require('../lib/errormessage');

let movieFinder = (locationObject, response) => {
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${locationObject.search_query}`;
  superagent.get(url)
    .then(request => {
      let movieData = request.body.results;
      const moviesArr = movieData.map(movie => new Movie(movie));
      response.send(moviesArr);
    })
    .catch(error => {
      console.error(error);
      response.status(500).send(errorMessage);
    });
  function Movie(movieData) {
    this.title = movieData.title;
    this.overview = movieData.overview;
    // eslint-disable-next-line camelcase
    this.average_votes = movieData.vote_average;
    // eslint-disable-next-line camelcase
    this.total_votes = movieData.vote_count;
    // eslint-disable-next-line camelcase
    this.image_url = movieData.poster_path;
    this.popularity = movieData.popularity;
    // eslint-disable-next-line camelcase
    this.released_on = movieData.release_date;
  }
};

module.exports = movieFinder;
