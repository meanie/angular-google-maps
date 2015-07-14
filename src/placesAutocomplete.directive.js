
/**
 * See: https://developers.google.com/maps/documentation/javascript/places-autocomplete
 *      https://github.com/kuhnza/angular-google-places-autocomplete/blob/master/src/autocomplete.js
 */

/**
 * Module definition and dependencies
 */
angular.module('Google.Maps.PlacesAutocomplete.Directive', [
  'Google.Maps.Api.Service',
  'Utility.Convert.Service'
])

/**
 * Directive
 */
.directive('placesAutocomplete', ['GoogleMapsApi', '$convert', function(
  Google, $convert
) {

  /**
   * Helper to find an address component type
   */
  function findAddressComponentOfType(place, type, format) {
    format = format || 'long_name';
    for (var c = 0; c < place.addressComponents.length; c++) {
      if (place.addressComponents[c].types.indexOf(type) !== -1) {
        return place.addressComponents[c][format];
      }
    }
    return '';
  }

  /**
   * Determine spread of a place, (e.g. for inaccurate addresses, like a suburb or city)
   */
  function determineSpread(place) {

    //Validate viewport data
    if (!place.geometry.viewport) {
      return 0;
    }

    //Get distance
    var distance = Google.maps.geometry.spherical.computeDistanceBetween(
      place.geometry.viewport.getNorthEast(), place.geometry.viewport.getSouthWest()
    );

    //Return rounded to meters
    return Math.round(distance * 1000) / 1000;
  }

  /**
   * Round lat/long values
   */
  function roundLatLng(num) {
    return Math.round(num * 10000000) / 10000000;
  }

  /**
   * Directive
   */
  return {
    restrict: 'A',
    scope: {
      place: '=placeModel',
      address: '=addressModel',
      geoLocation: '=geoLocation'
    },
    link: function(scope, element, attrs) {

      //Autocomplete options
      var options = {};

      //Restrict by types?
      if (attrs.restrictTypes) {
        options.types = attrs.restrictTypes.split(',');
      }

      //Restrict by country?
      if (attrs.restrictCountry) {
        options.componentRestrictions = options.componentRestrictions || {};
        options.componentRestrictions.country = attrs.restrictCountry;
      }

      //Initialize autocomplete API now with options
      var autocomplete = new Google.maps.places.Autocomplete(element[0], options);

      //Set bounds if geo location given
      if (scope.geoLocation && angular.isObject(scope.geoLocation) && scope.geoLocation.coords) {
        var circle = new Google.maps.Circle({
          radius: scope.geoLocation.coords.accuracy,
          center: new Google.maps.LatLng(
            scope.geoLocation.coords.latitude, scope.geoLocation.coords.longitude
          )
        });
        autocomplete.setBounds(circle.getBounds());
      }

      /**
       * Place changed handler
       */
      function placeChanged() {

        //Get selected place and convert keys
        var place = autocomplete.getPlace();
        place = $convert.object.keysToCamelCase(place);

        //Set in scope
        scope.$apply(function() {

          //Set entire place in scope model
          scope.place = place;

          //Set specific filtered address details in scope
          scope.address = scope.address || {};
          scope.address.selected = true;
          scope.address.enteredValue = element[0].value;
          scope.address.spread = determineSpread(place);
          scope.address.latitude = roundLatLng(place.geometry.location.lat());
          scope.address.longitude = roundLatLng(place.geometry.location.lng());
          scope.address.vicinity = place.vicinity;
          scope.address.streetNumber = findAddressComponentOfType(place, 'street_number');
          scope.address.streetName = findAddressComponentOfType(place, 'route');
          scope.address.city = findAddressComponentOfType(place, 'locality');
          scope.address.postalCode = findAddressComponentOfType(place, 'postal_code');
        });
      }

      /**
       * Event listener for place changes
       */
      var listener = Google.maps.event.addListener(
        autocomplete, 'place_changed', placeChanged
      );

      /**
       * Event listener for scope destruction
       */
      scope.$on('$destroy', function(event) {
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
