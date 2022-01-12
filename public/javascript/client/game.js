
let player_type;
const slider = document.getElementById("sizeSlider");
const gameStatus = document.getElementById("gameStatus");
const turnStatus = document.getElementById("turnStatus");
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

function reset_game()
{
    for (let i = 0; i < 9; i++)
    {
        document.getElementById(`s${i}`).innerHTML = "";
    }
    resetButton.remove();
    turnStatus.innerHTML = "Turn undecided...";
    gameStatus.innerHTML = "Waiting for another player...";
    waiting_for_player = setInterval(update_waiting(), 500);
    connect();  
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
        gameStatus.innerText = `Waiting for another player${".".repeat(phase)}`;
        phase = (phase + 1) % 4;
    }
}

let waiting_for_player = setInterval(update_waiting(), 500);

function getSquareFunction(squareNum)
{
    return function ()
    {
        if (ws.readyState === 1) // Websocket is connected
        {
            send_message(TMOVE, squareNum, ws);
        }
        else
        {
            console.log("Not currently in a game");
        }
        
    } 
}

function updateSquare(update_info)
{
    let square = document.getElementById(`s${update_info.square}`);
    square.style.color = update_info.colour;
    square.innerHTML = update_info.colour === "red" ? "X": "O";
}

for (let i = 0; i < 9; i++)
{
   // document.getElementById(`s${i}`).onclick = getSquareFunction(i);
}

slider.max = Math.min(screen.width, screen.height)/10;

slider.oninput = () =>
{
    root.style.setProperty("--cell-size", `${slider.value}px`);
};

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
            turnStatus.innerHTML = message.data === player_type ? "It's your turn" : "It's not your turn";
            break;
        case TUPDATE:
            if (message.data == 'c') {capturePiece(cpiece);}
            square.appendChild(currentPiece);
            break;            
        case TWON:
            if (message.data === "draw") {turnStatus.innerHTML = "The game is a draw!";}
            else {turnStatus.innerHTML = message.data === player_type ? "You won!" : "You lost :("};
            game_over("You finished a match...");
            break;
        case TQUIT:
            turnStatus.innerHTML = "";
            game_over("The other player quit :(");
            break;
        }
    })
}

connect();
