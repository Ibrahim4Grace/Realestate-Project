const express = require('express');
const router = express.Router();
const OurAgent  = require('../models/agent');
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');


// Define the route to fetch agent data
router.get('/api/agent',checkAuthenticated, async (req, res) => {
    try {
      const agents = await OurAgent.find(); 
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agent data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

module.exports = router;



