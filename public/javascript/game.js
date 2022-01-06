let player_type;
const root = document.querySelector(":root");
const slider = document.getElementById("sizeSlider");
const gameStatus = document.getElementById("gameStatus");
const turnStatus = document.getElementById("turnStatus");
let resetButton;
let ws;

let gameBoard = decodeFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
let dragged; // Piece being currently dragged

drawPieces(gameBoard);


// Custom drag behvaiour because standard dragging is ugly
// and makes the piece translucent ?wtf?
for (const piece of document.querySelectorAll(".piece"))
{
    piece.addEventListener("mousedown", (event) =>
    {
        const piece = event.target;

        // Position needs to be absolute so we can drag it around outside square
        piece.style.position = "absolute";

        const setPos = (x, y) => {
            piece.style.left = x - piece.width/2 + "px";
            piece.style.top = y - piece.height/2 + "px";
        }
        setPos(event.clientX, event.clientY);

        const mouseMoveF = (event) =>
        {
            setPos(event.clientX, event.clientY);
        }

        const mouseUpF = (event) =>
        {
            // First remove all document related event listeners to stop draggin
            document.removeEventListener("mousemove", mouseMoveF);
            document.removeEventListener("mouseup", mouseUpF);
            // Banking on proper ordering of elemetents here :/
            // Also prevents placing on another piece since that shifts the td element one down the list
            let square = document.elementsFromPoint(event.clientX, event.clientY)[1];
            
            // We've successfully found a new square
            if (square.nodeName === "TD")
            {
                square.appendChild(piece);
            }
            // Position piece relative to square again. Will go back to original if new square wasn't found
            piece.style.position = "static";
        }
        // Add event to process dragging within board
        // Works outside too, don't ask me why
        document.addEventListener("mousemove", mouseMoveF);
        document.addEventListener("mouseup", mouseUpF)

       // Prevent default dragging
       event.preventDefault();
    });
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
        if (message.type === TPLAYERT)
        {
            player_type = message.data;
        }
        else if (message.type === TGAMESTART)
        {
            clearInterval(waiting_for_player);
            gameStatus.innerHTML = "Your are player: " + `<span style="color:${player_type};">${player_type}</span>`; 
        }
        else if (message.type === TRESPONSE)
        {
            console.log("Server: ", message.data);
        }
        else if (message.type === TTURN)
        {   
            turnStatus.innerHTML = message.data === player_type ? "It's your turn" : "It's not your turn";
        }
        else if (message.type === TUPDATE)
        {
            updateSquare(message.data);
        }
        else if (message.type === TWON)
        {
            if (message.data === "Draw") {turnStatus.innerHTML = "The game is a draw!";}
            else {turnStatus.innerHTML = message.data === player_type ? "You won!" : "You lost :("};
            game_over("You finished a match...");
        }
        else if (message.type === TQUIT)
        {
            turnStatus.innerHTML = "";
            game_over("The other player quit :(");
        }
    })
}

connect();
