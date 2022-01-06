function isLower(c)
{
    return c === c.toLowerCase();
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

if (typeof exports !== "undefined")
{
    exports.isLower = isLower;
    exports.decodeFEN = decodeFEN;
}

