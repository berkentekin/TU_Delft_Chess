const board = document.getElementById("chessboard");

const pieceHTML = (piece) => `<img src="pieces/${piece}.svg" class="piece">`;

// Generate table layout for chess board, done once on load
for (let row = 0; row < 8; row++)
{
    let rowt = document.createElement("tr");
    for (let col = 0; col < 8; col++)
    {
        let square = document.createElement("td");
        // Square number
        square.setAttribute("data-pos", row*8 + col);
        square.className = ((col + row) % 2 == 0) ? "white": "black";

        rowt.appendChild(square);
    }
    board.appendChild(rowt);
}

function getSquares()
{
    return board.querySelectorAll("td");
}

function drawPieces(gameBoard)
{
    for (square of board.querySelectorAll("td"))
    {
        let pos = square.getAttribute("data-pos");
        let piece = gameBoard[pos];
        if (piece == '') {continue;}
        square.innerHTML = pieceHTML(piece);
        square.childNodes[0].pos = pos; // Set position of piece to pos
    }
}
