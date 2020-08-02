const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const fetch = require("node-fetch");

app.use(express.static("public"));

app.get("/our-api", async (req, res) => {
    let subKey = "XXXXXXXXXXXXXXX";
    let distance = 200;
    let lat = -36.8497513;
    let lng = 174.762881;

    let url = `https://api.at.govt.nz/v2/gtfs/stops/geosearch?lat=${lat}&lng=${lng}&distance=${distance}`;
    console.log(url);
    let response = await fetch(url, {
        headers: {
            "Ocp-Apim-Subscription-Key": subKey
        }
    });

    // Below is what we need to send to Aashi's part
    let result = await response.json();
    res.send({
        "Stop Code": result.response[0].stop_code,
        "Stop Name": result.response[0].stop_name,
        "Latitude": result.response[0].stop_lat,
        "Longitude": result.response[0].stop_lon,
    });
});

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);