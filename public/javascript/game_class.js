const { Chess } = require("chess.js");

class Game
{
    constructor()
    {
        this.chess = new Chess();
        this.players = {};
        this.times = {}; 
        this.sabotages = {};
        this.numPlayers = 0;
        this.turn = "white";
        this.activePlayer = 0;
        this.no_turns = 1;
        this.timer = null;
    }

    get_fen()
    {
        return this.chess.fen();
    }

    accepted_moves(square) // square is an optional parameter
    {
        if (typeof square === "undefined")
            return this.chess.moves();
        return this.chess.moves({ "square": square });
    }

    get_active_turn(wsID)
    {
        return this.players[wsID];
    }

    make_move(data, wsID)
    {
        let attemptedPiece = this.chess.get(data["from"]);
        if (attemptedPiece !== null)
        {
            let pieceColor = attemptedPiece["color"] === 'w' ? "white" : "black";
            let allMoves = this.chess.moves({"square": data["from"]});
            if (pieceColor !== this.get_active_turn(wsID) || !this.is_full()) {
                return { "moveInfo": null, "piece": data["piece"], "allMoves": allMoves, "pieceFrom": data["from"]};
            }
            else {
                let move = this.chess.move({ "from": data["from"], "to": data["to"], "promotion": data["promotion"] });
                if (this.chess.turn() === "w") {
                    this.no_turns++;
                }
                if (move !== null)
                    this.times[this.turn] += 5;
                return {
                    "moveInfo": move, "allMoves": allMoves, "piece": data["piece"], "pieceFrom": data["from"],
                    "pieceTo": data["to"], "time": this.times[this.turn], "color": this.turn
                };
            }
        }
        
    }

    decrement_time(opponentColor)
    {
        this.times[opponentColor] -= 1;
        return { "color": opponentColor, "time": this.times[opponentColor] };
    }

    is_full()
    {
        return this.numPlayers === 2;
    }

    in_check()
    {
        return this.chess.in_check();
    }

    check_game_over()
    {
        return this.chess.game_over();
    }
    check_won()
    {
        return this.chess.in_checkmate();
    }

    check_draw()
    {
        if (!this.chess.in_checkmate())
        {
            if (this.chess.in_draw())
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }

    undo()
    {
        return this.chess.undo();
    }

    show_turn()
    {
        this.turn = this.chess.turn() === "w" ? "white" : "black";
        return this.turn;
    }

    add_player(wsID)
    {
        if (this.players.length > 2) {throw "Cannot have more than 2 players!";}
        var player_colour = (this.numPlayers++) == 0 ? "white": "black";
        this.players[wsID] = player_colour;
        this.sabotages[wsID] = 2;
        this.times[player_colour] = 600;
        return player_colour;
    }

    sabotage(wsID)
    {
        if (this.sabotages[wsID] > 0)
        {
            this.sabotages[wsID]--;
            return true;
        }
        return false;
    }

    switch_player_colours()
    {
        console.log(this.players);
        for (const [key, value] of Object.entries(this.players))
        {
            this.players[key] = value == "white" ? "black" : "white";
        }
        console.log(this.players);
    }
}



module.exports = Game;