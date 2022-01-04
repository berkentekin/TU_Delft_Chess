class Game
{
    constructor()
    {
        this.players = {};
        this.numPlayers = 0;
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.turn = "blue";
    }

    is_full()
    {
        return this.numPlayers === 2;
    }

    check_won()
    {
        // Check horizontals
        for (let row = 0; row < 3; row++)
        {
            let has_won = true;
            let colour = this.board[row * 3];
            for (let column = 1; column < 3; column++)
            {
                if (this.board[column + row*3] !== colour)
                {
                    has_won = false;
                    break;
                }
            }
            if(has_won && colour !== "")
            {
                this.turn = "";
                return colour;
            }
        }

        // Check verticals
        for (let column = 0; column < 3; column++)
        {
            let has_won = true;
            let colour = this.board[column];
            for (let row = 1; row < 3; row++)
            {
                if (this.board[column + row*3] !== colour)
                {
                    has_won = false;
                    break;
                }
            }
            if(has_won && colour !== "")
            {
                this.turn = "";
                return colour;
            }
        }

        let colour = this.board[0];
        let has_won = true;
        // Check diagonal positive
        for (let i = 1; i < 3; i++)
        {
            if (this.board[i + 3*i] !== colour)
            {
                has_won = false;
                break;
            }
        }
        if (has_won && colour !== "")
        {
            this.turn = "";
            return colour;
        }

        colour = this.board[2];
        has_won = true;
        // Check diagonal negative
        for (let i = 1; i < 3; i++)
        {
            if (this.board[(3-i-1) + 3*i] !== colour)
            {
                has_won = false;
                break;
            }
        }
        if (has_won && colour !== "")
        {
            this.turn = "";
            return colour;
        }

        if (this.board.every((square) => (square !== '')))
        {
            this.turn = "";
            return "Draw";
        }
        return null;
    }

    make_move(square, wsID)
    {
        if (this.turn === "") {return ["Game not in progess!", null];} // Error game was stopped for some reason e.g. already won
        if (!this.is_full()) {return ["Game has not started yet!", null];} // Error game not started
        if (this.board[square] !== '') {return ["Cannot play an occupied square!", null];} // Error square already in use

        let colour = this.players[wsID];
        if (this.turn !== colour) {return ["It is not your turn!", null];} // Error not player's turn yet
        
        this.board[square] = colour;
        this.turn = this.turn === "blue" ? "red" : "blue"; // Change turn to next player

        return [null, {square: square, colour: colour}]; // Return updated square
    }

    add_player(wsID)
    {
        if (this.players.length > 2) {throw "Cannot have more than 2 players!";}
        let player_colour = (this.numPlayers++) == 0 ? "red": "blue";
        this.players[wsID] = player_colour;
        return player_colour;
    }
}



module.exports = Game;