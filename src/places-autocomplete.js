/**
 * Module definition and dependencies
 */
angular.module('Google.Maps.PlacesAutocomplete.Component', [
  'Google.Maps.Api.Service',
])

/**
 * Directive
 */
.component('placesAutocomplete', {
  template: `<ng-transclude/>`,
  transclude: true,
  bindings: {
    geoLocation: '<',
    options: '<',
    onChange: '&',
  },
  controller(GoogleMapsApi, $timeout, $convert, $element) {

    //Rename
    const Google = GoogleMapsApi;

    /**
     * Post link
     */
    this.$postLink = function() {

      //Get data
      const {geoLocation, options} = this;
      const $input = $element.find('input');

      //Initialize autocomplete API now with options
      this.autocomplete = new Google.maps.places.Autocomplete(
        $input[0], options
      );

      //Set bounds if geo location given
      if (
        geoLocation && typeof geoLocation === 'object' && geoLocation.coords
      ) {
        const circle = new Google.maps.Circle({
          radius: geoLocation.coords.accuracy,
          center: new Google.maps.LatLng(
            geoLocation.coords.latitude,
            geoLocation.coords.longitude
          ),
        });
        this.autocomplete.setBounds(circle.getBounds());
      }

      //Kill auto complete
      $timeout(() => $input.attr('autocomplete', 'goawaygoogle'), 100);

      //Add listener for place changes
      this.listener = Google.maps.event.addListener(
        this.autocomplete, 'place_changed', () => {

          //Get selected place and convert keys
          const place = this.autocomplete.getPlace();
          place.inputValue = $input[0].value;

          //Trigger handler
          this.placeChanged(place);
        }
      );
    };

    /**
     * On changes
     */
    this.$onChanges = function() {

      //Propagate options
      if (this.autocomplete && this.options) {
        this.autocomplete.setOptions(this.options);
      }
    };

    /**
     * On destroy
     */
    this.$onDestroy = function() {
      Google.maps.event.removeListener(this.listener);
      Google.maps.event.clearInstanceListeners(this.autocomplete);
      let containers = document.getElementsByClassName('pac-container');
      for (let i = 0; i < containers.length; i++) {
        containers[i].parentNode.removeChild(containers[i]);
      }
    };

    /**
     * Place changed handler
     */
    this.placeChanged = function(place) {
      place = $convert.object.keysToCamelCase(place);
      $timeout(() => {
        this.onChange({place});
      });
    };
  },
});
