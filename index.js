const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const fetch = require("node-fetch");
const { query } = require("express");

app.use(express.static("public"));

app.get("/our-api", async (req, res) => {
  console.log("query", req.query);
  let subKey = "265a800754904599a1bb96cd591a3d1f";
  let distance = 500;

  let url = `https://api.at.govt.nz/v2/gtfs/stops/geosearch?lat=${req.query.lat}&lng=${req.query.lng}&distance=${distance}`;
  console.log(url);
  let response = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": subKey,
    },
  });

  let result = await response.json();
  res.json({
    "Stop Code": result.response[0].stop_code,
    "Stop Name": result.response[0].stop_name,
    Latitude: result.response[0].stop_lat,
    Longitude: result.response[0].stop_lon,
  });
});

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
app.get("/find", (req, res) => res.sendFile(__dirname + "/public/find.html"));
app.get("/connectbuddy", (req, res) => res.sendFile(__dirname + "/public/connectbuddy.html"));
app.get("/walkwithbuddy", (req, res) => res.sendFile(__dirname + "/public/walkwithbuddy.html"));
app.get("/endScreen", (req, res) => res.sendFile(__dirname + "/public/endScreen.html"));
app.get("/loadingScreen", (req, res) => res.sendFile(__dirname + "/public/loadingScreen.html"));
app.get("/GoMeetYourBuddy", (req, res) => res.sendFile(__dirname + "/public/GoMeetYourBuddy.html"));

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
