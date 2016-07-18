
/**
 * Module definition and dependencies
 */
angular.module('Google.Maps.PlacesAutocomplete.Directive', [
  'Google.Maps.Api.Service'
])

/**
 * Directive
 */
.directive('placesAutocomplete', ['GoogleMapsApi', function(Google) {
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
    controller($scope, $attrs, $element, $convert) {

      //Set options
      $scope.options = $scope.options || {};

      /**
       * Place changed handler
       */
      $scope.placeChanged = function(place) {
        if ($attrs.onChange) {
          $scope.onChange({
            place: $convert.object.keysToCamelCase(place)
          });
        }
      };
    },

    /**
     * Linking function
     */
    link(scope, element) {

      //Initialize autocomplete API now with options
      let autocomplete = new Google.maps.places.Autocomplete(
        element[0], scope.options
      );

      //Set bounds if geo location given
      if (scope.geoLocation && angular.isObject(scope.geoLocation) && scope.geoLocation.coords) {
        let circle = new Google.maps.Circle({
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
        let place = autocomplete.getPlace();
        place.inputValue = element[0].value;

        //Set in scope
        scope.$apply(() => {
          scope.placeChanged(place);
        });
      }

      /**
       * Event listener for place changes
       */
      let listener = Google.maps.event.addListener(
        autocomplete, 'place_changed', placeChanged
      );

      //Event listener for scope destruction
      scope.$on('$destroy', () => {
        Google.maps.event.removeListener(listener);
        Google.maps.event.clearInstanceListeners(autocomplete);
        let containers = document.getElementsByClassName('pac-container');
        for (let i = 0; i < containers.length; i++) {
          containers[i].parentNode.removeChild(containers[i]);
        }
      });
    }
  };
}]);
