var moveBox = (function () {
    const moveTable = document.getElementById("move-table");
    var turn = 1;
    var latestRow = null;
    return {
        writeMove: function (color, san) {
            if (color === "black") { // white has played
                latestRow = moveTable.insertRow();
                var turnCell = latestRow.insertCell();
                turnCell.innerHTML = turn;
                var whiteCell = latestRow.insertCell();
                whiteCell.innerHTML = san;
            }
            else { // black has played
                var blackCell = latestRow.insertCell();
                blackCell.innerHTML = san;
                turn++;
            }
        }
    }

})();