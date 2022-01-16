var express = require('express');
var router = express.Router();
var stats = require("../statTracker.js");


router.get("/", function(req, res) {
	res.render("splash", stats);
});

router.get("/play", (req, res) => 
{
    res.sendFile("game.html", {root:"./public"});
});

module.exports = router;
