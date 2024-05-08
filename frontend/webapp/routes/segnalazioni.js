const express = require('express');
const router = express.Router();

const backendURL = "http://localhost:3000/api/v1/segnalazioni"

router.get("/", async(req, res)=>{
    fetch(backendURL).then(data => {
    // Handle the data returned from the server
    console.log(data);

  })
  .catch(error => {
    // Handle any errors that occurred during the fetch
    console.error('Fetch error:', error);
  });
})


