/**
 * In-game stat tracker. 
 * Once the game is out of prototype status, this object will be backed by a database.
 */
 const gameStatus = {
    ongoingGames: 0,
    numOfPlayers: 0,
    whiteWins: 0,
    blackWins: 0
  };
  
  module.exports = gameStatus;