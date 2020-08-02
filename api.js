// function getBusStops() {
//     let busStopDiv = document.getElementById('busStop');

//     fetch('https://api.at.govt.nz/v2/gtfs/stops/geosearch?lat=-36.8497513&lng=174.762881&distance=500')
//         .then(res => res.json())
//         .then(bstop => {
//             busStopDiv.innerHTML += `<p> ${bstop.bstop} </p>`
//         })
// }

// https://api.at.govt.nz/v2/gtfs/stops/geosearch?lat={lat}&lng={lng}&distance={distance}&


let subKey = "xxxxxxxxxxxxxxxxxxxxxxx";

function getBusStops() {
    var params = {
        "lat": "-36.8497513",
        "lng": "174.762881",
        "distance": "500",
        // "callback": "{string}",
    };

    $.ajax({
            url: "https://api.at.govt.nz/v2/gtfs/stops/geosearch?lat={lat}&lng={lng}&distance={distance}&" + $.param(params),
            beforeSend: function (xhrObj) {
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subKey);
            },
            type: "GET",
            // Request body
            data: "{body}", // lat, long, stop code, stop name
        })
        .done(function (data) {
            alert("success");
        })
        .fail(function () {
            alert("error");
        });
};