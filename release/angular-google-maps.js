/**
 * @meanie/angular-google-maps * https://github.com/meanie/
 *
 * Copyright (c) 2020 Adam Reis <adam@reis.nz>
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
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (window, angular, undefined) {
  'use strict';
  /**
   * Module definition and dependencies
   */

  angular.module('Google.Maps.PlacesAutocomplete.Component', ['Google.Maps.Api.Service'])

  /**
   * Directive
   */
  .component('placesAutocomplete', {
    template: '<ng-transclude/>',
    transclude: true,
    bindings: {
      geoLocation: '<',
      options: '<',
      onChange: '&'
    },
    controller: ['GoogleMapsApi', '$timeout', '$convert', '$element', function controller(GoogleMapsApi, $timeout, $convert, $element) {

      //Rename
      var Google = GoogleMapsApi;

      /**
       * Post link
       */
      this.$postLink = function () {
        var _this = this;

        //Get data
        var geoLocation = this.geoLocation,
            options = this.options;

        var $input = $element.find('input');

        //Initialize autocomplete API now with options
        this.autocomplete = new Google.maps.places.Autocomplete($input[0], options);

        //Set bounds if geo location given
        if (geoLocation && (typeof geoLocation === 'undefined' ? 'undefined' : _typeof(geoLocation)) === 'object' && geoLocation.coords) {
          var circle = new Google.maps.Circle({
            radius: geoLocation.coords.accuracy,
            center: new Google.maps.LatLng(geoLocation.coords.latitude, geoLocation.coords.longitude)
          });
          this.autocomplete.setBounds(circle.getBounds());
        }

        //Kill auto complete
        $timeout(function () {
          return $input.attr('autocomplete', 'goawaygoogle');
        }, 100);

        //Add listener for place changes
        this.listener = Google.maps.event.addListener(this.autocomplete, 'place_changed', function () {

          //Get selected place and convert keys
          var place = _this.autocomplete.getPlace();
          place.inputValue = $input[0].value;

          //Trigger handler
          _this.placeChanged(place);
        });
      };

      /**
       * On changes
       */
      this.$onChanges = function () {

        //Propagate options
        if (this.autocomplete && this.options) {
          this.autocomplete.setOptions(this.options);
        }
      };

      /**
       * On destroy
       */
      this.$onDestroy = function () {
        Google.maps.event.removeListener(this.listener);
        Google.maps.event.clearInstanceListeners(this.autocomplete);
        var containers = document.getElementsByClassName('pac-container');
        for (var i = 0; i < containers.length; i++) {
          containers[i].parentNode.removeChild(containers[i]);
        }
      };

      /**
       * Place changed handler
       */
      this.placeChanged = function (place) {
        var _this2 = this;

        place = $convert.object.keysToCamelCase(place);
        $timeout(function () {
          _this2.onChange({ place: place });
        });
      };
    }]
  });
})(window, window.angular);