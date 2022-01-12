
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

//let waiting_for_player = setInterval(update_waiting(), 500);


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
            // Get info here
            // Then call movePieceTo (please keep this in function, it's also used elsewhere mind you)
           // movePieceTo(arg1, arg2, arg3)    
           // Keep last arg to true since we want opponent moves to be animated
    
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
