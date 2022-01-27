const express = require("express");
const {send_message, decode_message,
      TMOVE, TUPDATE,
      TPLAYERT, TGAMESTART, TTURN, TWON, 
	  TTABLE, TINVALID, TTIME, TCHAT,
	  TCHECK, TSABOTAGE, TINFO, THIGHLIGHT, TDRAW} = require("./public/javascripts/messages");
const Game = require("./public/javascripts/game_class");
const {WebSocketServer} = require("ws");
const { send } = require("express/lib/response");
const app = express();
const port = 3000;
const indexRouter = require("./routes/index");
let stats = require("./statTracker");

app.use(express.static("public"));

let num_players = 0;
let players = [];
let numConnectionIDs = 0;


app.set("view engine", "ejs");
app.get("/", indexRouter);
app.get("/play", indexRouter);

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

wss.on("connection", (ws, req) => 
{ 
	ws.id = numConnectionIDs++;
	stats.numOfPlayers += 1;

	function setCountdown(color) {
		if (game.timer !== null)
			clearInterval(game.timer);
		game.timer = null;
		game.timer = setInterval(() => {
			var opponentPlayerTime = game.decrement_time(color);
			sendMessageToGame(TTIME, opponentPlayerTime, ws.game);
			if (opponentPlayerTime["time"] === 0) {
				sendMessageToGame(TWON, {"player": color === "white" ? "black": "white", "type": "timeout"}, game);
				clearInterval(game.timer);
				return;
			}
		}, 1000);
	};
	ws.on("message", (data) =>
	{
		let message = decode_message(data);
		if (message.type === THIGHLIGHT) {
			if (message.data["opponent"] === true) {
				send_message(THIGHLIGHT, {"moveInfo": [message.data["from"], message.data["to"]], "player_color": message.data["color"], "opponent_only": true,
										  "opponent_color": game.get_active_turn(ws.id)},
				 ws);
			}
			else 
			{
				let available_moves = game.accepted_moves(message.data["from"], ws.id);
				if (typeof available_moves !== "undefined") {
					available_moves.push(message.data["from"]);
					send_message(THIGHLIGHT, {"moveInfo": available_moves, "opponent_only": false}, ws);
				}
			}
		}
		else if (message.type === TINFO) {
			let available_moves = game.accepted_moves(message.data["from"], ws.id);
			send_message(TINFO, {"available_moves": available_moves, "piece": message.data["piece"], 
								"pieceFrom": message.data["from"], "pieceTo": message.data["to"]}, ws);
		}
		else if (message.type === TDRAW) {
			switch (game.addDrawOffer(message.data)) {
				case 0:
					sendMessageToGame(TCHAT, `<span style='color:red'>[Server]: The draw offer has been cancelled! </span>`, game);
					break;
				case 1:
					sendMessageToGame(TCHAT, `<span style='color:red'>[Server]: A draw offer has been made by the ${message.data} player! </span>`, game);
					break;
				case 2:
					sendMessageToGame(TCHAT, `<span style='color:red'>[Server]: Both players have agreed on a draw! </span>`, game);
					clearInterval(game.timer);
					sendMessageToGame(TWON, "draw", game);
					break;
            }
        }
		else if (message.type === TMOVE) {
			let accepted_moves = game.accepted_moves();
			let response = game.make_move(message.data, ws.id);
			let move = response["moveInfo"];
			let current_player = game.show_turn(); // Note: this is the opposite to the player who sent the message
				//if (!accepted_moves.includes(move.san)) { response["moveInfo"] = null };

			if (move !== null && accepted_moves.includes(move.san)) {
				if (response["drawCancelled"] === true) {
					sendMessageToGame(TCHAT, `<span style='color:red'>[Server]: The draw offer has been cancelled! </span>`, game);
				}
				sendMessageToGame(TUPDATE, {"response": response}, game);
				sendMessageToGame(TTURN, { "move": move.san, "turn": game.show_turn() }, game);
				sendMessageToGame(TTABLE, { "move": move.san, "turn": game.show_turn() }, game);

				setCountdown(current_player);

				if (game.in_check() && !game.check_won()) {
					sendMessageToGame(TCHECK, game.show_turn(), game);
					sendMessageToGame(TCHAT, `<span style='color:red'>[Server]: The ${game.show_turn()} king is checked!`, game);
				}

				if (game.check_game_over()) {
					if (game.check_won()) {
						sendMessageToGame(TWON, {"player": game.get_active_turn(ws.id), "type": "checkmate"}, game);	
						if (game.get_active_turn(ws.id) === "white")
						{
							stats.whiteWins += 1;
						}
						else
						{
							stats.blackWins += 1;
						}
					}
					else if (game.check_draw()) {
						sendMessageToGame(TWON, "stalemate", game);
	
					}
					clearInterval(game.timer);
				}
			}	
			else
			{
				if (message.data["from"] === message.data["to"])
					send_message(TINVALID, {"response" : response, "sameSquare": true}, ws);
				else
					send_message(TINVALID, {"response" : response, "sameSquare": false}, ws);
			}
		
		}
		else if (message.type === TCHAT) {
			let messageText = message.data;
			sendMessageToGame(TCHAT, `[${ws.id}]: ${messageText}`, ws.game);
		}
		else if (message.type === TWON) { // Only sent to server when a player resigns
			sendMessageToGame(TWON, {"player": color === "white" ? "black": "white", "type": "resign"}, game);
			clearInterval(game.timer);
			games = games.filter((x) => x !== ws.game); // Remove game if still present
		}
		else if (message.type === TSABOTAGE)
		{
			if (!ws.game.is_full()) {return;}
			if (!ws.game.sabotage(ws.id)) {return;}
			sendMessageToGame(TSABOTAGE, {"layout": ws.game.get_fen()}, ws.game);
			sendMessageToGame(TCHAT, "<span style='color:red'>[Server]: Someone sabotaged the game, the server is failing! </span>", ws.game);
			ws.game.switch_player_colours();
			setCountdown(ws.game.show_turn()); // Make sure we can't drain the opponent's time
		}
	});

	ws.on("close", (event) =>
		{
			stats.numOfPlayers -= 1;
		
			if (ws.game.check_game_over() || ws.game.no_turns == -1 || !ws.game.is_full()) {return;}
			
			stats.ongoingGames -= 1;
			ws.game.no_turns = -1;
			sendMessageToGame(TWON, {"player": color === "white" ? "black": "white", "type": "resign"}, game);
			clearInterval(game.timer);
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
		stats.ongoingGames += 1;
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
