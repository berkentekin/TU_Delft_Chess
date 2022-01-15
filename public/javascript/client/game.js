let player_type;
const slider = document.getElementById("sizeSlider");
const gameStatus = document.getElementById("gameStatus");
const prankRules = document.getElementById("prank");
let gameStarted = false;

let resetButton;
let ws;

createPieces(decodeFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"));

function openrules()
{
    prankRules.style.width = "100%";
}

function closerules()
{
    prankRules.style.width = "0";
}

function sabotage()
{
    if (gameStarted)
    {
        send_message(TSABOTAGE, null, ws);
    }
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
        
        const setGameStatusText = () =>
        {
            let textColour = player_type === "white" ? "var(--light-theme)": "black";
            gameStatus.style.color = "black";
            gameStatus.innerHTML = "Your are player: " + `<span style="color:${textColour};">${player_type}</span>`;
        }

        const removeHighlight = (message) =>
        {
            // Remove highlights once the piece is moved
            var allMoves = message.data["allMoves"];
            allMoves.push(message.data["pieceFrom"]);
            console.log(allMoves);
            remove_highlight(fetchSquares(allMoves));
        }
    
        switch (message.type)
        {
            case TPLAYERT:
                player_type = message.data;
                break;
            case TGAMESTART:
                var whiteTimer = document.getElementById("timer-white");
                var blackTimer = document.getElementById("timer-black");
                if (player_type === "black") {
                    switchBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
                    whiteTimer.id = "timer-black";
                    blackTimer.id = "timer-white";
                }
                else
                {   
                    whiteTimer.id = "timer-white";
                    blackTimer.id = "timer-black";
                }

                // Make sure the correct timer have the underline
                whiteTimer.classList.remove("displayed-timer");
                blackTimer.classList.add("displayed-timer");

                setGameStatusText();

                clearInterval(waitingInterval);
                gameStarted = true; 
                break;
            case TRESPONSE:
                console.log("Server: ", message.data);
                break;
            case TTURN:
                // Maybe highlight timer to make it obvious
                document.querySelectorAll(".timer").forEach(timer => timer.style.setProperty("font-weight", "normal"));
                document.getElementById(`timer-${message.data["turn"]}`).style.setProperty("font-weight", "700");
                break;
            case TTABLE:
                moveBox.writeMove(message.data["turn"], message.data["move"]);
                break;
            case TUPDATE:
                piece = getPiece(getSquare(message.data["piece"]["pos"]));  // HTML element info gets lost in translation so we retrieve it
                finalizeMove(piece, getSquare(encodePos(message.data["pieceTo"])), player_type);
                let flag = message.data["moveInfo"]["flags"];

                if (flag.includes('p'))
                {
                    promotePawn(piece, message.data["moveInfo"]["color"], message.data["moveInfo"]["promotion"]);
                }
                if (flag === 'k' || flag === 'q') {
                    castle(flag, message.data["moveInfo"]["color"]);
                }
                else if (flag === 'e') {
                    enPassant(message.data["moveInfo"]["color"], message.data["pieceTo"], player_type);
                }
                var remainingSeconds = message.data["time"];
                var minutes = remainingSeconds / 60 | 0; // Get the integer part
                var seconds = remainingSeconds % 60;
                if (seconds < 10) seconds = `0${seconds}`;
            
                var displayTimer = document.getElementById(`timer-${message.data["color"]}`);
                displayTimer.innerText = `${minutes}:${seconds}`;

                
                // Remove highlights once the piece is moved
                removeHighlight(message);
                break;

            case TCHECK:
                playSound("check");    
                break;
            case TINFO:
                break;
            case THIGHLIGHT:
                var squares = fetchSquares(message.data);
                squares.forEach((square) => {
                    var square_class = square.getAttribute("class").split(" ")[0];
                    var square_color = square_class.split("-")[0];
                    if (["white", "black"].includes(square_class)) {
                        square.setAttribute("class", `${square_color}-highlight chess-cell force-overlap`);
                        if (square_color === "black")
                            square.style.backgroundColor = '#ffa07a';
                        else if (square_color === "white")
                            square.style.backgroundColor = "#ffc3aa";
                    }
                    else if (["white-highlight" ,"black-highlight"].includes(square_class)) {
                        square.setAttribute("class", `${square_color} chess-cell force-overlap`);
                        if (square_color === "black")
                            square.style.backgroundColor = '#2448a3';
                        else if (square_color === "white")
                            square.style.backgroundColor = "white";
                    } 
                });
                break;

            case TINVALID:  // Player has commited a nono
                piece = message.data["piece"];
                invalidMove(getPiece(getSquare(piece["pos"])));
                removeHighlight(message);
                break;
            case TWON:
                gameStarted = false;
                let winType
                console.log(message.data);
                if (message.data === "draw")
                {
                    winType = "It's a stalemate!";
                }
                else
                {
                    let won = message.data["player"] == player_type;
                    winType = won ? `You won by ${message.data["type"]}!`:
                                                                      `You lost by ${message.data["type"]} :/`;
                    let score = document.getElementById(`${won ? "self": "opponent"}-score`);
                    score.innerText = (+score.innerText) + 1;
                }
                game_over(winType);
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
            case TSABOTAGE:
                player_type = player_type === "white" ? "black" : "white";
                switchBoard(message.data["layout"]);

                setGameStatusText();
                
                // Switch around timers
                var whiteTimer = document.getElementById("timer-white");
                var blackTimer = document.getElementById("timer-black");

                let tempID = whiteTimer.id;
                let tempText = whiteTimer.innerText;
                whiteTimer.id = blackTimer.id;
                whiteTimer.innerText = blackTimer.innerText;
                blackTimer.id = tempID;
                blackTimer.innerText = tempText;
                break;
            case TQUIT:
                game_over("The other player quit :(");
                break;
        }
    })
}

connect();
