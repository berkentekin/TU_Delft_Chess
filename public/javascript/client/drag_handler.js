
//const sounds = [new Audio("sounds/sound1.wav"), new Audio("sounds/sound2.mp3"), new Audio("sounds/sound3.mp3")]

// Function added to pieces for drag functionality
const mouseDownF = (event) =>
{
    if (!gameStarted) {return;} 
    const piece = event.target;
    const pieceFrom = decodePos(piece.parentNode.getAttribute("data-pos"));

    // Position needs to be absolute so we can drag it around outside square
    piece.className = "dragging-piece";

    // Make sure to account for page offset, otherwise results are funky
    const setPos = (x, y) => {
        piece.style.left = x + window.pageXOffset - piece.width/2 + "px";
        piece.style.top = y + window.pageYOffset - piece.height/2 + "px";
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
        // Yeah okay so the previous solution broke pretty quickly so here's to a new solution
        // Instead we search for the grid element so we can also have text
        let square = Array.from(document.elementsFromPoint(event.clientX, event.clientY))
                    .filter((node) => node.nodeName === "DIV")[0];

        // We've successfully found a new square
        if (square !== undefined)
        {
            wasMovedManually = true;
	        movePieceTo(piece, pieceFrom, square);
        }
    }
    // Add event to process dragging within board
    // Works outside too, don't ask me why
    document.addEventListener("mousemove", mouseMoveF);
    document.addEventListener("mouseup", mouseUpF)

   // Prevent default dragging behaviour
   event.preventDefault();
}

function removeDrag(piece)
{
    piece.removeEventListener("mousedown", mouseDownF);
}

function addDrag(piece)
{
    piece.addEventListener("mousedown", mouseDownF);
}

// Custom drag behvaiour because standard dragging is ugly
// and makes the piece translucent ?wtf?
const addPiecesDrag = () => document.querySelectorAll(".piece").forEach((piece) => addDrag(piece));
