const board = document.getElementById("chessboard");
const captured = document.getElementById("captured-zone");
const keyboardInput = document.getElementById("keyboard-input");
const keyboardInputForm = document.getElementById("keyboard-input-form");
const chatInput = document.getElementById("chat-input");
const root = document.querySelector(":root");

let sounds = {"move-self": new Audio("sounds/move-self.webm"),
              "capture": new Audio("sounds/capture.webm"),
              "invalid": new Audio("sounds/illegal.webm"),
              "check": new Audio("sounds/move-check.webm")};

const playSound = (sound) =>
{
    // Reset sound incase it hasn't finished playback yet
    sounds[sound].currentTime = 0;
    sounds[sound].muted = false; // Chrome support
    sounds[sound].play();   
};

const createPieceImg = (piece) => 
{
    let img = document.createElement("img");
    img.src = `pieces/${piece}.svg`;
    img.className = "piece";
    data = document.createAttribute("piece-data");
    data.value = piece;
    img.setAttributeNode(data);
    img.type = piece[1]; // Only need type not colour info
    return img;
};

function fetchSquares(decodedPositions) {
    let square_array = [];
    decodedPositions.forEach((pos) => {
        square_array.push(getSquare(encodePos(pos)));
    });
    return square_array;
}

addAnimationAfterEffect(board, (el) => {el.style.setProperty("opacity", 1)});

///
///    Note to self, just build based on board colour, since that is given straight away
///
///

// Generate table layout for chess board, done once on load
for (let row = 0; row < 8; row++)
{
    for (let col = 0; col < 8; col++)
    {
        let square = document.createElement("div");
        square.setAttribute("data-pos", row*8 + col);
        square.className = (((col + row) % 2 == 0) ? "white": "black") + " chess-cell force-overlap";
        square.style.setProperty("grid-column-start", col + 1);
        square.style.setProperty("grid-row-start", row + 1);
        square.style.setProperty("--animation-order", row*8 + col + 1);
   
        addAnimationAfterEffect(square, (el) => {el.style.setProperty("opacity", 1)});

        let textArea;

        const addSpan = (text, type) =>
        {
            if (textArea === undefined)
            {
                textArea = document.createElement("span");
                textArea.className = "positions-area";
            }
            let span = document.createElement("span");
            span.textContent = text;
            span.className = type + " positions";
            textArea.appendChild(span);
        }

        if (col === 0) addSpan(8 - row, "supersleft");
        if (row === 7) addSpan(["a", "b", "c", "d", "e", "f", "g", "h"][col], "subsright");

        if (textArea !== undefined)
        {
            square.append(textArea);
        }
        board.appendChild(square);
    }
}

// This function has unusual behaviour and should be used sparingly
function makeDisappear(piece)
{
    if (enableMoveAnimation)
    {
        piece.style.transform = "translateY(-100%)";
        piece.style.opacity = "0";
        piece.addEventListener("transitionend", () => {
            piece.remove();
        });
    }   
    else {piece.remove();}
}

// Generalize this to both colours incase of restart
function switchBoard(fen)
{
    for (square of board.querySelectorAll("div[data-pos]"))
    {
        let pos = square.getAttribute("data-pos");
        let piece = square.querySelector("img");
        if (piece !== null) {makeDisappear(piece)};   

        square.setAttribute("data-pos", 63 - pos);
    }
    for (textArea of document.getElementsByClassName("supersleft positions"))
    {
        textArea.innerHTML = 9 - textArea.innerHTML;
    }
    for (textArea of document.getElementsByClassName("subsright positions"))
    {
        textArea.innerHTML = String.fromCharCode(201 - textArea.innerHTML.charCodeAt(0)); // 'h' - innerHTML + 'a' to reverse the letters
    }
    createPieces(decodeFEN(fen));
}


root.style.setProperty("--board-size", `${board.clientWidth}px`);
window.addEventListener("resize", () =>
{
    root.style.setProperty("--board-size", `${board.clientWidth}px`);
});

function createPieces(gameBoard)
{
    for (square of board.querySelectorAll("div[data-pos]"))
    {
        let pos = square.getAttribute("data-pos");
        let piece = gameBoard[pos];
        if (piece == '') {continue;}
        let img = createPieceImg(piece);
        img.pos = pos; 

        square.appendChild(img);
    }
    addPiecesDrag();
}

function getPiece(square)
{
    return square.querySelector("img");
}

function getSquare(num)
{
    return document.querySelector(`div[data-pos="${num}"]`);
}


let capturedOffset = {"p":0, "r":0, "n":0, "b":0, "q": 0}

function capturePiece(piece, color)
{
    if (piece.getAttribute("piece-data").charAt(0) !== color.charAt(0))
    {
        let capturedZone = captured.querySelector(`#${piece.type}-captured`);
        piece.className = "captured-piece";
        capturedZone.appendChild(piece);

        // Needs to be updated if captured pieces size is updated ;;;
        // Bit of redundancy here, but oh well. Since capturedZone is relative, it does not
        // resize due to the absolutely placed pieces inside, so we have to set this ourselves;
        capturedZone.style.width = `calc(var(--board-size)/11 * (0.8 * 0.4 * ${capturedOffset[piece.type]} + 0.8))`;
        piece.style.left = `calc(var(--board-size)/11 * 0.8 * 0.4 * ${capturedOffset[piece.type]})`; // Absolute position relative to cell
        piece.style.top = 0 + "px"; // Sometimes top is random, what the hell?
        capturedOffset[piece.type]++;

        removeDrag(piece);
    }
    else
    {
        makeDisappear(piece);
    }   
}

function promotePawn(pawn, color, to) // Pawn being promoted, color of player, to type of
{
    // Get relevant info then discard old piece
    let piece = color.charAt(0) + to;

    pawn.src = `pieces/${piece}.svg`;
    pawn.type = to;
    pawn.setAttribute("piece-data", piece);
}

function enPassant(color, pieceTo, selfColour)
{
    var toCapture;
    if (color === 'w') {
        toCapture = `${pieceTo.charAt(0)}${parseInt(pieceTo.charAt(1))-1}`
    } else if (color === 'b') {
        toCapture = `${pieceTo.charAt(0)}${parseInt(pieceTo.charAt(1))+1}`
    }
    capturePiece(getPiece(getSquare(encodePos(toCapture))), selfColour);
    playSound("capture");
}

function castle(flag, color)
{
    if (flag === 'k') {
        if (color === 'w') {
            var rook = getPiece(getSquare(encodePos("h1")));
            finalizeMove(rook, getSquare(encodePos("f1")), color);
        } else {
            var rook = getPiece(getSquare(encodePos("h8")));
            finalizeMove(rook, getSquare(encodePos("f8")), color);
        }

    } else if (flag === 'q') {
        if (color === 'w') {
            var rook = getPiece(getSquare(encodePos("a1")));
            finalizeMove(rook, getSquare(encodePos("d1")), color);
        } else {
            var rook = getPiece(getSquare(encodePos("a8")));
            finalizeMove(rook, getSquare(encodePos("d8")), color);
        }
    } 
}

function movePieceTo(piece, pieceFrom, square)
{

    let pieceTo = decodePos(square.getAttribute("data-pos"));
    let pieceData = piece.getAttribute("piece-data");
    if ((pieceData === "wp" && pieceFrom.charAt(1) === '7' && pieceTo.charAt(1) === '8') || (pieceData === "bp" && pieceFrom.charAt(1) === '2' && pieceTo.charAt(1) === '1')) {
        if (pieceFrom.charAt(0) === pieceTo.charAt(0)) { // TODO fetch all available squares for the pawn
            var promote = window.prompt("'q' for Queen, 'n' for Knight, 'r' for Rook, 'b' for Bishop").toLowerCase();
            if (promote === null || promote === "") {
                piece.className = "piece";
                playSound("invalid");
                return;
            }
            send_message(TMOVE, { "piece": piece, "from": pieceFrom, "to": pieceTo, "promotion": promote }, ws);
            return;
        }       
    }
    send_message(TMOVE, {"piece": piece, "from": pieceFrom, "to": pieceTo}, ws);
}

let wasMovedManually = false;

function invalidMove(piece)
{
    playSound("invalid");
    wasMovedManually = false;
    // Position piece relative to square again. Will go back to original if new square wasn't found
    piece.className = "piece";
}

function finalizeMove(piece, square, color) 
{
    let animate;

    if (!wasMovedManually) {animate = animateParentChange1(piece);}
    else                   {animate = false;}

    wasMovedManually = false; // Reset. This whole thing is kinda hacky, but oh well

    let cpiece = getPiece(square);
    square.appendChild(piece);
    piece.className = "piece";
    piece.pos = square.getAttribute("data-pos"); 
    
    const finishAction = () => {

        if (cpiece !== null && cpiece !== piece)
        {
            playSound("capture");
            capturePiece(cpiece, color);
        }
        else {playSound("move-self");}   
    }

    if (animate) {animateParentChange2(piece, finishAction);}
    else {finishAction();} 
}

window.addEventListener("keypress", (event) =>
{
    if (event.key === "Enter" && document.activeElement !== chatInput)
    {
        keyboardInput.style.display = "block";
        keyboardInput.focus();
    }
});

keyboardInputForm.addEventListener("submit", (event) =>
{
    event.preventDefault(); // Prevent reloading
    // Take away input again

    if (!gameStarted) {
        keyboardInput.value = "";
        keyboardInput.style.display = "none"; 
        return;
    }

    try
    {
        let positions = [keyboardInput.value.substring(0, 2), keyboardInput.value.substring(2, 4)];
        let from = getSquare(encodePos(positions[0]));
        console.log(positions[0]);


        let to = getSquare(encodePos(positions[1]));
        let piece = getPiece(from);
        
        if (piece !== null && to !== null)
        {
            movePieceTo(piece, positions[0], to);
        }
    }
    catch {}

    keyboardInput.value = "";
    keyboardInput.style.display = "none"; 
});
