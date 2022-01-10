const board = document.getElementById("chessboard");
const captured = document.getElementById("captured-zone");
const root = document.querySelector(":root");
const keyboardInput = document.getElementById("keyboard-input");
const keyboardInputForm = document.getElementById("keyboard-input-form");
const chatInput = document.getElementById("chat-input");

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

// Generate table layout for chess board, done once on load
for (let row = 0; row < 8; row++)
{
    for (let col = 0; col < 8; col++)
    {
        let square = document.createElement("div");
        square.setAttribute("data-pos", row*8 + col);
        square.className = (((col + row) % 2 == 0) ? "white": "black") + " chess-cell force-overlap";
        square.style["grid-column-start"] = col + 1;
        square.style["grid-row-start"] = row + 1;

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

window.addEventListener("resize", () =>
{
    root.style.setProperty("--board-size", `${board.clientWidth}px`);
})
root.style.setProperty("--board-size", `${board.clientWidth}px`);

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

function movePieceTo(piece, square)
{
    let pieceTo = decodePos(square.getAttribute("data-pos"));
    let cpiece = getPiece(square); // Check if there's a piece there to capture
    if (cpiece !== null && cpiece !== piece) {capturePiece(cpiece);} // Make sure we're not capturing ourselves 
        square.appendChild(piece);
            //sounds[Math.floor(Math.random() * sounds.length)].play();
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
    
    let positions = keyboardInput.value.split('-');
    let from = getSquare(encodePos(positions[0]));
    let to = getSquare(encodePos(positions[1]));
    let piece = getPiece(from);

    if (piece !== null && to !== null)
    {
        movePieceTo(piece, to);
    }
    // Throw some error otherwise

    // Take away input again
    keyboardInput.value = "";
    keyboardInput.style.display = "none"; 

    event.preventDefault(); // Prevent reloading
});