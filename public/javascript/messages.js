function send_message(type, data, websocket)
{
    websocket.send(JSON.stringify({"type": type, "data": data}));
}

function decode_message(event)
{
    return JSON.parse(event.data);
}

const TMOVE = "MOVE";      // Player has moved (contains square played on)
const TRESPONSE = "RESPONSE" // Some server response (e.g. illegal move)
const TQUIT = "QUIT";      // Player has quit
const TUPDATE = "UPDATE";  // Board updated (contains updated squares)
const TPLAYERT = "TPLAYERT"; // Player type assigned (contains white/black)
const TGAMESTART = "GAMESTART"; // Game has started
const TTURN = "TURN"; // Player's turn (contains colour of player whose turn it is)
const TWON = "WON"; // A Player won (contains colour of winning player)
const TCHECK = "CHECK"; // Sent when a player is in check (contains color of the player in check)
const TTABLE = "TABLE"; // Sent when a player is in check (contains color of the player in check)
const TINVALID = "INVALID"; // Player attempted an invalid move
const TTIME = "TIME"; // Updates timer, the data will be player color and remaining time

if (typeof exports !== "undefined") {
    exports.send_message = send_message
    exports.decode_message = function(data)
    {
        return JSON.parse(data);
    };
    module.exports = Object.assign({}, exports, {TMOVE: TMOVE, TRESPONSE: TRESPONSE, TQUIT: TQUIT,
                                          TUPDATE: TUPDATE, TPLAYERT: TPLAYERT, TGAMESTART: TGAMESTART,
                                          TTURN: TTURN, TWON: TWON, TTABLE: TTABLE, TINVALID: TINVALID, TTIME: TTIME});
};
