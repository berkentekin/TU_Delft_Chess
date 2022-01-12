const { Chess } = require("chess.js");

class Game
{
    constructor()
    {
        this.chess = new Chess();
        this.players = {};
        this.numPlayers = 0;
        this.turn = "white";
    }

    accepted_moves()
    {
        return this.chess.moves();
    }

    make_move(data)
    {
        let move = this.chess.move(data);
        return move;  
    }

    is_full()
    {
        return this.numPlayers === 2;
    }

    check_won()
    {
        return this.chess.in_checkmate();
    }

    check_draw()
    {
        if (!this.chess.in_checkmate())
        {
            if (this.chess.insufficient_material() || this.chess.in_stalemate())
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