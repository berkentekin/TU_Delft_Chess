const board = document.getElementById("chessboard");
const captured = document.getElementById("captured-zone");

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
    let rowt = document.createElement("tr");
    for (let col = 0; col < 8; col++)
    {
        let square = document.createElement("td");
        square.className = "chess-cell";
        // Square number
        let se = document.createElement("div");
        se.setAttribute("data-pos", row*8 + col);
        se.className = (((col + row) % 2 == 0) ? "white": "black") + " grid-cell force-overlap";
        square.appendChild(se);

        const addSpan = (text, type) =>
        {
            let span = document.createElement("span");
            span.textContent = text;
            span.className = type + " positions";
            se.appendChild(span);
        }

        if (col === 0) addSpan(8 - row, "supersleft");
        if (row === 7) addSpan(["a", "b", "c", "d", "e", "f", "g", "h"][col], "subsright");

        rowt.appendChild(square);
    }
    board.appendChild(rowt);
}

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

let capturedOffset = {"p":0, "r":0, "n":0, "b":0, "q": 0}

function capturePiece(piece)
{
    let capturedZone = captured.querySelector(`#${piece.type}-captured`);

    piece.className = "captured-piece";
    capturedZone.appendChild(piece);

    // Needs to be updated if captured pieces size is updated ;;;
    // Bit of redundancy here, but oh well. Since capturedZone is relative, it does not
    // resize due to the absolutely placed pieces inside, so we have to set this ourselves;
    capturedZone.style.width = `calc(var(--cell-size) * (0.8 * 0.4 * ${capturedOffset[piece.type]} + 0.8 - 0.2))`;
    piece.style.left = `calc(var(--cell-size) * 0.8 * 0.4 * ${capturedOffset[piece.type]})`; // Absolute position relative to cell
    piece.style.top = 0 + "px"; // Sometimes top is random, what the hell?

    removeDrag(piece);

    capturedOffset[piece.type]++;
}
