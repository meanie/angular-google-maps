/**
 * @meanie/angular-google-maps * https://github.com/meanie/
 *
 * Copyright (c) 2018 Adam Reis <adam@reis.nz>
 * License: MIT
 */
(function (window, angular, undefined) {
  'use strict';

  /**
   * Module definition and dependencies
   */

  angular.module('Google.Maps.Api.Service', [])

  /**
   * Wrapper for google maps API
   */
  .factory('GoogleMapsApi', ['$window', function ($window) {
    if (!$window.google || !$window.google.maps) {
      throw new Error('Global `google` variable or `google.maps` missing.' + 'Make sure to include the relevant external Google script(s).');
    }
    return $window.google;
  }]);
})(window, window.angular);
(function (window, angular, undefined) {
  'use strict';

  /**
   * Module definition and dependencies
   */

  angular.module('Google.Maps.PlacesAutocomplete.Directive', ['Google.Maps.Api.Service'])

  /**
   * Directive
   */
  .directive('placesAutocomplete', ['GoogleMapsApi', '$timeout', function (Google, $timeout, $convert) {
    return {
      restrict: 'A',
      scope: {
        geoLocation: '=',
        options: '=',
        onChange: '&'
      },

      /**
       * Controller
       */
      controller: ['$scope', '$attrs', function controller($scope, $attrs) {

        //Set options
        $scope.options = $scope.options || {};

        /**
         * Place changed handler
         */
        $scope.placeChanged = function (place) {
          if ($attrs.onChange) {
            $scope.onChange({
              place: $convert.object.keysToCamelCase(place)
            });
          }
        };
      }],


      /**
       * Linking function
       */
      link: function link(scope, element) {

        //Initialize autocomplete API now with options
        var autocomplete = new Google.maps.places.Autocomplete(element[0], scope.options);

        //Set bounds if geo location given
        if (scope.geoLocation && angular.isObject(scope.geoLocation) && scope.geoLocation.coords) {
          var circle = new Google.maps.Circle({
            radius: scope.geoLocation.coords.accuracy,
            center: new Google.maps.LatLng(scope.geoLocation.coords.latitude, scope.geoLocation.coords.longitude)
          });
          autocomplete.setBounds(circle.getBounds());
        }

        //Kill auto complete
        $timeout(function () {
          return element.attr('autocomplete', 'goawaygoogle');
        }, 100);

        /**
         * Place changed handler
         */
        function placeChanged() {

          //Get selected place and convert keys
          var place = autocomplete.getPlace();
          place.inputValue = element[0].value;

          //Set in scope
          scope.$apply(function () {
            scope.placeChanged(place);
          });
        }

        /**
         * Event listener for place changes
         */
        var listener = Google.maps.event.addListener(autocomplete, 'place_changed', placeChanged);

        //Event listener for scope destruction
        scope.$on('$destroy', function () {
          Google.maps.event.removeListener(listener);
          Google.maps.event.clearInstanceListeners(autocomplete);
          var containers = document.getElementsByClassName('pac-container');
          for (var i = 0; i < containers.length; i++) {
            containers[i].parentNode.removeChild(containers[i]);
          }
        });
      }
    };
  }]);
})(window, window.angular);