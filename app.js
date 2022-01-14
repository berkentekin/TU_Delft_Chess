const express = require("express");
const {send_message, decode_message,
      TMOVE, TRESPONSE, TQUIT, TUPDATE,
      TPLAYERT, TGAMESTART, TTURN, TWON, 
	  TBOARD, TTABLE, TINVALID, TTIME, TCHAT} = require("./public/javascript/messages");
const Game = require("./public/javascript/game_class");
const {WebSocketServer} = require("ws");
const { send } = require("express/lib/response");
const app = express();
const port = 3000;

app.use(express.static("public"));

let num_players = 0;
let players = [];
let numConnectionIDs = 0;


app.get("/", (req, res) => 
{
    res.sendFile("index.html");
});

let sockets = {};

// Clear sockets every 5 seconds 
// Cannot do this like games because node is async
setInterval(() =>
{
	for (const [ID, socket] of Object.entries(sockets)) {
		if (socket.readyState === 3) // Socket has been closed
		{
			delete sockets[ID];
		}
	}
}, 5000);

const server = app.listen(port, () =>
{
    console.log(`Server now running on port ${port}`);
})

const wss = new WebSocketServer({server});


function sendMessageToGame(type, data, game)
{
	let wsIDs = Object.keys(game.players);
	for (ID of wsIDs)
	{
		if (sockets[ID] !== undefined)
		{
			send_message(type, data, sockets[ID]);
		}
	}
}

let games = []
let timer = null;

wss.on("connection", (ws, req) => 
{ 
	ws.id = numConnectionIDs++;
	function setCountdown(color) {
		if (timer !== null)
			clearInterval(timer);
		timer = null;
		timer = setInterval(() => {
			var opponentPlayerTime = game.decrement_time(color);
			sendMessageToGame(TTIME, opponentPlayerTime, ws.game);
			if (opponentPlayerTime["time"] === 0) {
				sendMessageToGame(TWON, "win", game);
				clearInterval(timer);
				return;
			}
		}, 1000);
	};
	ws.on("message", (data) =>
	{

		let message = decode_message(data);
		if (message.type === TMOVE) {

		
			let accepted_moves = game.accepted_moves();
			let response = game.make_move(message.data, ws.id);
			let move = response["moveInfo"];
			let current_player = game.show_turn();
				//if (!accepted_moves.includes(move.san)) { response["moveInfo"] = null };

			
			
			if (move !== null && accepted_moves.includes(move.san)) {
				sendMessageToGame(TUPDATE, response, game);
				sendMessageToGame(TTURN, { "move": move.san, "turn": game.show_turn() }, game);
				sendMessageToGame(TTABLE, { "move": move.san, "turn": game.show_turn() }, game);

				setCountdown(current_player);

				if (game.check_game_over()) {
					if (game.in_check() && !game.check_won()) {
						sendMessageToGame(TCHECK, game.show_turn(), game);
					}
					else if (game.check_won()) {
						sendMessageToGame(TWON, "win", game);
						//		sendMessageToGame(TWON, won, ws.game);
					}
					else if (game.check_draw()) {
						sendMessageToGame(TWON, "draw", game);
							//	sendMessageToGame(TTURN, ws.game.turn, ws.game);
	
					}
				}
				else
				{

				}
			}	
			else
			{
				send_message(TINVALID, response, ws);
			}
		
		}
		else if (message.type === TCHAT) {
			let messageText = message.data;
			sendMessageToGame(TCHAT, `[${ws.id}]: ${messageText}`, ws.game);
		}
	});

	ws.on("close", (event) =>
		{
		//	sendMessageToGame(TQUIT, null, ws.game);    // Make sure all clients close the connection
			games = games.filter((x) => x !== ws.game); // Remove game if still present
		}
	)

	console.log(`Websocket connection opened for ${numConnectionIDs}`);

	let game = games[games.length -1];

	if (game === undefined || game.is_full())
	{
		game = new Game();
		games.push(game);
	}

    ws.game = game;
	let color = game.add_player(ws.id);
    sockets[ws.id] = ws;
	send_message(TPLAYERT, color, ws);

	if (game.is_full()) {
		sendMessageToGame(TGAMESTART, null, game);
		sendMessageToGame(TTURN, { "turn": game.turn }, game);
	}
})

process

  // Handle normal exits
  .on('exit', (code) => {
    nodemon.emit('quit');
    process.exit(code);
  })

  // Handle CTRL+C
  .on('SIGINT', () => {
    nodemon.emit('quit');
    process.exit(0);
  });
