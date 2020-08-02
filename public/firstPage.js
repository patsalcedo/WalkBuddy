var map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: -36.86667,
      lng: 174.76667,
    },
    zoom: 13,
  });
  infoWindow = new google.maps.InfoWindow();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        dest_longitude = 174.7513029;
        dest_latitude = -36.8450387;

        infoWindow.setPosition(pos);
        var marker = new google.maps.Marker({
          position: pos,
          map: map,
        });
        map.setCenter(pos);
        console.log("position is", pos);
        prefill(pos.lat, pos.lng);

        var autocomplete = autoComplete();
        autocomplete.bindTo("bounds", map);

        // Set the data fields to return when the user selects a place.
        autocomplete.setFields([
          "address_components",
          "geometry",
          "icon",
          "name",
        ]);

        var infowindow = new google.maps.InfoWindow();
        var url = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        var marker = new google.maps.Marker({
          map: map,
          //anchorPoint: new google.maps.Point(0, -29),
          icon: {
            url: url,
          },
        });

        // var bustopLocation = getBustop(pos.lng, pos.lat);
        // console.log("got the bus stop location", bustopLocation);

        // infoWindow.setPosition(bustopLocation);
        // var marker = new google.maps.Marker({
        //   position: bustopLocation,
        //   map: map,
        //   icon: {
        //     url: "../bus.png",
        //   },
        // });
        // map.setCenter(bustopLocation);

        autocomplete.addListener("place_changed", function () {
          infowindow.close();
          marker.setVisible(false);
          var place = autocomplete.getPlace();
          if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert(
              "No details available for input: '" + place.name + "'"
            );
            return;
          }

          // If the place has a geometry, then present it on a map.
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17); // Why 17? Because it looks good.
          }
          marker.setPosition(place.geometry.location);
          marker.setVisible(true);

          var address = "";
          if (place.address_components) {
            address = [
              (place.address_components[0] &&
                place.address_components[0].short_name) ||
              "",
              (place.address_components[1] &&
                place.address_components[1].short_name) ||
              "",
              (place.address_components[2] &&
                place.address_components[2].short_name) ||
              "",
            ].join(" ");
          }

          infowindow.open(map, marker);
          //  new AutocompleteDirectionsHandler(map);
        });

        getBustop(pos.lng, pos.lat).then((location) => {
          let coordinates = {
            lat: Number(location.Latitude),
            lng: Number(location.Longitude),
          };
          infoWindow.setPosition(coordinates);
          let marker = new google.maps.Marker({
            position: coordinates,
            map: map,
            icon: "bus.png",
            scaledSize: new google.maps.Size(10, 10),
          });
          map.setCenter(coordinates);
        });
        // console.log("got the bus stop location", bustopLocation);

        // console.log(bustopLocation);

        // let coordinates = {
        //   lat = bustopLocation.Latitude,
        //   lng = bustopLocation.Longitude
        // }
        // console.log(coordinates)

        // infoWindow.setPosition(bustopLocation);
        // var marker = new google.maps.Marker({
        //   position: coordinates,
        //   map: map,
        //   icon: {
        //     url: "bus.png",
        //   },
        // });
        // map.setCenter(bustopLocation);
      },
      function () {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

async function getBustop(longitude, latitude) {
  let response = await fetch("/our-api?lat=" + latitude + "&lng=" + longitude);
  let result = await response.json();
  console.log("result", result);
  return result;
}

function prefill(lant, long) {
  var currentAddress;
  console.log("the prefill", lant, long);
  fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
      lant +
      "," +
      long +
      "&key=AIzaSyCh9AyGTUDBlpt90boFwHBjOISwRbBym20&language=en&result_type=street_address"
    )
    .then((res) => res.json())
    .then((json) => {
      currentAddress = json.results[0].formatted_address;
      document.getElementById("current").value = currentAddress;
    });
}

function autoComplete() {
  var input = document.getElementById("destination");
  var options = {
    componentRestrictions: {
      country: "nz",
    },
  };

  autocomplete = new google.maps.places.Autocomplete(input, options);
  return autocomplete;
}

function AutocompleteDirectionsHandler(map) {
  this.map = map;
  this.originPlaceId = null;
  this.destinationPlaceId = null;
  this.travelMode = "WALKING";
  this.directionsService = new google.maps.DirectionsService();
  this.directionsRenderer = new google.maps.DirectionsRenderer();
  this.directionsRenderer.setMap(map);

  var originInput = document.getElementById("current");
  var destinationInput = document.getElementById("destination");
  var modeSelector = document.getElementById("mode-selector");

  var originAutocomplete = new google.maps.places.Autocomplete(originInput);
  // Specify just the place data fields that you need.
  originAutocomplete.setFields(["place_id"]);

  var destinationAutocomplete = new google.maps.places.Autocomplete(
    destinationInput
  );
  // Specify just the place data fields that you need.
  destinationAutocomplete.setFields(["place_id"]);

  this.setupClickListener("changemode-walking", "WALKING");
  this.setupClickListener("changemode-transit", "TRANSIT");
  this.setupClickListener("changemode-driving", "DRIVING");

  this.setupPlaceChangedListener(originAutocomplete, "ORIG");
  this.setupPlaceChangedListener(destinationAutocomplete, "DEST");

  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
    destinationInput
  );
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (
  id,
  mode
) {
  var radioButton = document.getElementById(id);
  var me = this;

  radioButton.addEventListener("click", function () {
    me.travelMode = mode;
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
  autocomplete,
  mode
) {
  var me = this;
  autocomplete.bindTo("bounds", this.map);

  autocomplete.addListener("place_changed", function () {
    var place = autocomplete.getPlace();

    if (!place.place_id) {
      window.alert("Please select an option from the dropdown list.");
      return;
    }
    if (mode === "ORIG") {
      me.originPlaceId = place.place_id;
    } else {
      me.destinationPlaceId = place.place_id;
    }
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.route = function () {
  if (!this.originPlaceId || !this.destinationPlaceId) {
    return;
  }
  var me = this;

  this.directionsService.route({
      origin: {
        placeId: this.originPlaceId,
      },
      destination: {
        placeId: this.destinationPlaceId,
      },
      travelMode: this.travelMode,
    },
    function (response, status) {
      if (status === "OK") {
        me.directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
};