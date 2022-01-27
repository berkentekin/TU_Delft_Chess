
function isLower(c)
{
    return c === c.toLowerCase();
}

function fetchSquares(decodedPositions) {
    let square_set = new Set();
    decodedPositions.forEach((pos) => {
        pos = pos.replace(/[+#]+/g, ''); // Removes all check/checkmate signs from positions
        if (pos.indexOf("=") === -1) {
            square_set.add(getSquare(encodePos(pos.slice(-2))));        
        } else {
            square_set.add(getSquare(encodePos(pos.slice(0, pos.indexOf("=")).slice(-2))));
        }

    });
    return square_set;
}

function add_highlight(squares) {
    squares.forEach((square) => {
        square.classList.add("highlight");       
    });
} 

function toggle_highlight(squares, darkcolor, lightcolor) {
    squares.forEach((square) => {
        square.classList.toggle("highlight");
    });
}

function remove_highlight(squares) {
    squares.forEach((square) => {
        square.classList.remove("highlight");       
    });
} 

function reset_highlight() {
    document.querySelectorAll('.highlight').forEach((s) => s.classList.remove('highlight'));
}

function decodeFEN(FENStr)
{
    let FENParts = FENStr.split(' ');

    // Takes the first part and forms the grid in an array of dimension 64
    // Formats pieces to {colour}{piece character}
    // Formats numbers to '' * number
    // '/' is ignored

    let board = FENParts[0].split('').flatMap((c) =>
    {
        if (!isNaN(c)) {return '.'.repeat(+c - 1).split('.');}
        if (c === '/') {return [];}
        return (isLower(c) ? 'b': 'w') + c.toLowerCase();
    });

    return board;
}

function decodePos(datapos)
{
    var letter = String.fromCharCode( (((datapos) % 8)) + 97 );
    return `${letter}${((63 - datapos)/8 | 0) + 1}`;
}   

function encodePos(pos)
{
    let col = pos.charCodeAt(0) - 97;
    return col + (8-pos[1]) * 8;
}

if (typeof exports !== "undefined")
{
    exports.isLower = isLower;
    exports.decodeFEN = decodeFEN;
}

function addAnimationAfterEffect(el, effect)
{
    const aEndF = () =>
    {
        effect(el);
        el.removeEventListener("animationend", aEndF);
    }
    el.addEventListener("animationend", aEndF);
}

