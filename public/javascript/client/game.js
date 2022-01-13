
let player_type;
const slider = document.getElementById("sizeSlider");
const gameStatus = document.getElementById("gameStatus");
const prankRules = document.getElementById("prank");

let resetButton;
let ws;

let gameBoard = decodeFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");

createPieces(gameBoard);

function openrules()
{
    prankRules.style.width = "100%";
}

function closerules()
{
    prankRules.style.width = "0";
}


function game_over(message)
{
    gameStatus.innerHTML = message;
    ws.close();
    resetButton = document.createElement("button");
    resetButton.innerHTML = "Find new game";
    resetButton.onclick = reset_game;
    document.getElementById("resetArea").appendChild(resetButton);
}

function update_waiting()
{
    let phase = 0;

    return () =>
    {
        //gameStatus.innerText = `Waiting for another player${".".repeat(phase)}`;
        phase = (phase + 1) % 4;
    }
}

let waiting_for_player = setInterval(update_waiting(), 500);

function connect()
{
        // Now we will establish wss connection
    ws = new WebSocket(`ws://${location.host}`);

    ws.addEventListener("open", () =>
    {
        console.log("Successfully connected websocket...");
        })
    
    ws.addEventListener("message", (event) =>
    {
        let message = decode_message(event);
        switch (message.type)
        {
        case TPLAYERT:
            player_type = message.data;
            break;
        case TGAMESTART:
            clearInterval(waiting_for_player);
            gameStatus.innerHTML = "Your are player: " + `<span style="color:${player_type};">${player_type}</span>`; 
            break;
        case TRESPONSE:
            console.log("Server: ", message.data);
            break;
        case TTURN:
            break;
        case TTABLE:
            moveBox.writeMove(message.data["turn"], message.data["move"]);
            break;
        case TUPDATE:
            let piece = message.data["piece"];
            finalizeMove(getPiece(getSquare(piece["pos"])), getSquare(encodePos(message.data["pieceTo"])));
            break;
        case TWON:
            game_over("You finished a match...");
            break;
        case TQUIT:
            game_over("The other player quit :(");
            break;
        }
    })
}

connect();
