const express = require('express');
require('dotenv').config();

const router = express.Router();

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080"

router.get("/", async (req, res) => {
  fetch(path.join(baseUrl, '/api/v1/segnalazioni'))
    .then(data => {
      // Handle the data returned from the server
      console.log(data);
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('Fetch error:', error);
    });
})


