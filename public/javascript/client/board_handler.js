const board = document.getElementById("chessboard");
const captured = document.getElementById("captured-zone");
const keyboardInput = document.getElementById("keyboard-input");
const keyboardInputForm = document.getElementById("keyboard-input-form");
const chatInput = document.getElementById("chat-input");
const root = document.querySelector(":root");

let sounds = {"move-self": new Audio("sounds/move-self.webm"),
              "capture": new Audio("sounds/capture.webm")};

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

addAnimationAfterEffect(board, (el) => {el.style.setProperty("opacity", 1)});

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

function capturePiece(piece)
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

    removeDrag(piece);

    capturedOffset[piece.type]++;
}

var pieceHandler = (function() {
    var currentPiece;
    var destinationSquare;
    return {
        assignPiece: function(piece) {
            this.currentPiece = piece;
        },
        assignSquare: function(square) {
            this.destinationSquare = square;
        },
        returnPiece: function() {
            return this.currentPiece;
        },
        returnSquare: function() {
            return this.destinationSquare;
        },
    };
})();

function movePieceTo(piece, pieceFrom, square)
{

    
    // Since you've made the pieceHandler already you could pass this through the message.
    let pieceTo = decodePos(square.getAttribute("data-pos"));
    send_message("MOVE", {"piece": piece, "from": pieceFrom, "to": pieceTo}, ws);

    // Second part of animation, but before capture
}

let wasMovedManually = false;

function finalizeMove(piece, square) 
{
    console.log(piece, "5");
    let animate;

    console.log(wasMovedManually);
    if (!wasMovedManually) {animate = animateParentChange1(piece);}
    else                   {animate = false;}

    wasMovedManually = false; // Reset. This whole thing is kinda hacky, but oh well

    let cpiece = getPiece(square);
    square.appendChild(piece);
    piece["pos"] =  square.getAttribute("data-pos"); 
    
    const finishAction = () => {

        if (cpiece !== null && cpiece !== piece)
        {
            playSound("capture");
            capturePiece(cpiece);
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
    
    try
    {
        let positions = [keyboardInput.value.substring(0, 2), keyboardInput.value.substring(2, 4)];
        let from = getSquare(encodePos(positions[0]));
        let to = getSquare(encodePos(positions[1]));
        let piece = getPiece(from);
        
        if (piece !== null && to !== null)
        {
            movePieceTo(piece, positions[0], to);
        }
    }
    catch {}

    // Take away input again
    keyboardInput.value = "";
    keyboardInput.style.display = "none"; 
});
