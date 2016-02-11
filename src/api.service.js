
/**
 * Module definition and dependencies
 */
angular.module('Google.Maps.Api.Service', [])

/**
 * Wrapper for google maps API
 */
.factory('GoogleMapsApi', function($window) {
  if (!$window.google || !$window.google.maps) {
    throw new Error(
      'Global `google` variable or `google.maps` missing.' +
      'Make sure to include the relevant external Google script(s).'
    );
  }
  return $window.google;
});
