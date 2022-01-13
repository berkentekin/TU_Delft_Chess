const { Chess } = require("chess.js");

class Game
{
    constructor()
    {
        this.chess = new Chess();
        this.players = {};
        this.numPlayers = 0;
        this.turn = "white";
        this.colors = {};
        this.activePlayer = 0;
        this.no_turns = 1;
    }

    accepted_moves()
    {
        return this.chess.moves();
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
            if (pieceColor !== this.get_active_turn(wsID)) {
                return { "moveInfo": null, "piece": data["piece"]};
            }
        }
        let move = this.chess.move({ "from": data["from"], "to": data["to"] , "promotion": data["promotion"]});
        if (this.chess.turn() === "w")
        {
            this.no_turns++;
        }
        return {"moveInfo": move, "piece": data["piece"], "pieceFrom": data["from"], "pieceTo": data["to"]};
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
        return player_colour;
    }
}



module.exports = Game;