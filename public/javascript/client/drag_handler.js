
//const sounds = [new Audio("sounds/sound1.wav"), new Audio("sounds/sound2.mp3"), new Audio("sounds/sound3.mp3")]

// Function added to pieces for drag functionality
const mouseDownF = (event) =>
{
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
	    let pieceTo = decodePos(square.getAttribute("data-pos"));
            let cpiece = getPiece(square); // Check if there's a piece there to capture
            if (cpiece !== null && cpiece !== piece) {capturePiece(cpiece);} // Make sure we're not capturing ourselves 
            square.appendChild(piece);
            //sounds[Math.floor(Math.random() * sounds.length)].play();
        }
        // Position piece relative to square again. Will go back to original if new square wasn't found
        piece.className = "piece"
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
document.querySelectorAll(".piece").forEach((piece) => addDrag(piece));
