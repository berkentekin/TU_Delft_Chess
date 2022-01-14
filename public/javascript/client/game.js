
let player_type;
const slider = document.getElementById("sizeSlider");
const gameStatus = document.getElementById("gameStatus");
const prankRules = document.getElementById("prank");
let gameStarted = false;

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

function handleWaitingTimer()
{
    if (self.on === null)
    {
        self.on = true;
    }
    
    gameStatus.style.color = self.on ? "black" : "white";
    self.on = !self.on;
}

let waitingInterval = setInterval(handleWaitingTimer, 500);


function game_over(message)
{
    gameStatus.innerHTML = message;
    ws.close();
    resetButton = document.createElement("button");
    resetButton.innerHTML = "Find new game";
    resetButton.onclick = reset_game;
    document.getElementById("resetArea").appendChild(resetButton);
}

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
        let piece;
        switch (message.type)
        {
        case TPLAYERT:
            player_type = message.data;
            break;
        case TGAMESTART:
                if (player_type === "black") {
                    var whiteTimer = document.getElementById("timer-white");
                    var blackTimer = document.getElementById("timer-black");
                    whiteTimer.id = "timer-black";
                    blackTimer.id = "timer-white";
                    setBlackBoard();
                     
                }
            clearInterval(waitingInterval);
            gameStarted = true;
            let textColour = player_type === "white" ? "var(--light-theme)": "black";
            gameStatus.style.color = "black";
            gameStatus.innerHTML = "Your are player: " + `<span style="color:${textColour};">${player_type}</span>`; 
            break;
        case TRESPONSE:
            console.log("Server: ", message.data);
            break;
        case TTURN:
            // Maybe highlight timer to make it obvious
            break;
        case TTABLE:
            moveBox.writeMove(message.data["turn"], message.data["move"]);
            break;
        case TUPDATE:
            piece = message.data["piece"];    
                finalizeMove(getPiece(getSquare(piece["pos"])), getSquare(encodePos(message.data["pieceTo"])));
                let flag = message.data["moveInfo"]["flags"];
                if (flag === 'k' || flag === 'q') {
                    castle(flag, message.data["moveInfo"]["color"]);
                }
                else if (flag === 'e') {
                    enPassant(flag, message.data["moveInfo"]["color"], message.data["pieceTo"]);
                }
                var remainingSeconds = message.data["time"];
                var minutes = remainingSeconds / 60 | 0; // Get the integer part
                var seconds = remainingSeconds % 60;
                if (seconds < 10) seconds = `0${seconds}`;
            
                var displayTimer = document.getElementById(`timer-${message.data["color"]}`);
                displayTimer.innerText = `${minutes}:${seconds}`;
                break;

            case TINVALID:  // Player has commited a nono
                piece = message.data["piece"];
                invalidMove(getPiece(getSquare(piece["pos"])));
                break;

            case TWON:
                game_over("You finished a match...");
                break;
            case TTIME:
                    var remainingSeconds = message.data["time"];
                    var minutes = remainingSeconds / 60 | 0; // Get the integer part
                    var seconds = remainingSeconds % 60;
                    if (seconds < 10) seconds = `0${seconds}`;
                    var displayTimer = document.getElementById(`timer-${message.data["color"]}`);
                    displayTimer.innerText = `${minutes}:${seconds}`;
                break;
            case TCHAT:
                addEntry(message.data);
                break;
            case TQUIT:
                game_over("The other player quit :(");
                break;
        }
    })
}

connect();
