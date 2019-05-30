const game = require('./gameState');

module.exports = () => {
	let players = {},
		onWait = [],
		onMatch = {};

	const loop = setInterval(checkQueue, 5000);

  function checkQueue() {
    console
      .info(`
        Queues: {
          Players: ${Object.keys(players).length},
          OnWait: ${onWait.length},
          OnMatch: ${Object.keys(onMatch).length}
        }`);
    // Print the pool values
    while (onWait.length >= 2) {
      console.log(`Building room...`);
      /*
      const p1 = players[onWait.pop()].user.name;
      const p2 = players[onWait.pop()].user.name;
      console.log(`We created a match for ${p1} and ${p2}`);
      */
      createMatch(onWait.pop(), onWait.pop());
    }
  }

  function createMatch(p1id, p2id) {
    const roomId = p1id + p2id;
    players[p1id].roomId = roomId;
    players[p2id].roomId = roomId;

    if (!onMatch[roomId]) onMatch[roomId] = game.newGame({
      players: [players[p1id], players[p2id]],
      roomId
    });

    players[p1id].socket.emit('gameState', game.newGame({
      players: [players[p1id], players[p2id]],
      roomId,
      playerId: 0,
      opponentId: 1
    }));

    players[p2id].socket.emit('gameState', game.newGame({
      players: [players[p1id], players[p2id]],
      roomId,
      playerId: 1,
      opponentId: 0
    }));
  }

	return {
		// user: {socket, user}
		userConnect: ({ socket, user }) => {
			if (!players[socket.id]) {
				// Add to player list
				players[socket.id] = { user, socket };
				// Add to waiting list
				onWait.push(socket.id);
			}
		},
		clear: () => clearInterval(loop),
		userDisconnect: (id) => {
			// Close ongoing game related to player if any
			console.log("On disconnect", id);
			if (players[id].roomID && onMatch[players[id].roomID]) {
				const roomID = players[id].roomID;
				// Put all players back on onWait
				onMatch[roomID].players.map(player => onWait.push(player.id));
				// Delete match room
				delete onMatch[players[id].roomID];
				// If the object gets deleted, reset it
				if (!onMatch) onMatch = {};
			}
			// Delete all instances of disconnecting player from waiting list (if any)
			onWait = onWait.filter(el => el !== id);
			// Delete from players list
			if (players[id]) {
				delete players[id];
				if (!players) players = {};
			}
		},
	}
};
