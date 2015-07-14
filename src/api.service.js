
/**
 * Module definition and dependencies
 */
angular.module('Google.Maps.Api.Service', [])

/**
 * Wrapper for google maps API
 */
.factory('GoogleMapsApi', function($window) {
  if (!$window.google) {
    throw new Error(
      'Global `google` variable missing. Make sure to include the relevant external ' +
      'Google script(s).'
    );
  }
  return $window.google;
});
