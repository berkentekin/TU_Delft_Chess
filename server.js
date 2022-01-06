const express = require("express");
const {send_message, decode_message,
      TMOVE, TRESPONSE, TQUIT, TUPDATE,
      TPLAYERT, TGAMESTART, TTURN, TWON} = require("./public/javascript/messages");
const Game = require("./public/javascript/game_class");
const {WebSocketServer} = require("ws");
const { send } = require("express/lib/response");
const app = express();
const port = 3000;

app.use(express.static("public"));

let num_players = 0;
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

wss.on("connection", (ws, req) => 
{ 
	ws.id = numConnectionIDs++;
	ws.on("message", (data) =>
	{
		let message = decode_message(data);
		if (message.type === TMOVE)
		{
			let [error, update_info] = ws.game.make_move(message.data, ws.id);
			if (error !== null)
			{
				send_message(TRESPONSE, error, ws);
			}
			else
			{
				sendMessageToGame(TUPDATE, update_info, ws.game);
				let won = ws.game.check_won();
		
				if (won !== null)
				{
					sendMessageToGame(TWON, won, ws.game);
				}
				else
				{
					sendMessageToGame(TTURN, ws.game.turn, ws.game);
				}
				
			}
		}
	});

	ws.on("close", (event) =>
		{
			sendMessageToGame(TQUIT, null, ws.game);    // Make sure all clients close the connection
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
	let colour = game.add_player(ws.id);
	sockets[ws.id] = ws;
	send_message(TPLAYERT, colour, ws);

	if (game.is_full())
	{
		sendMessageToGame(TGAMESTART, null, game);
		sendMessageToGame(TTURN, game.turn, game);
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