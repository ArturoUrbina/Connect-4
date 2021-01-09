const chalk = require('chalk');

const handler = (io) => {
    let rooms = [];

    const winningArray = [
        [0, 1, 2, 3],
        [41, 40, 39, 38],
        [7, 8, 9, 10],
        [34, 33, 32, 31],
        [14, 15, 16, 17],
        [27, 26, 25, 24],
        [21, 22, 23, 24],
        [20, 19, 18, 17],
        [28, 29, 30, 31],
        [13, 12, 11, 10],
        [35, 36, 37, 38],
        [6, 5, 4, 3],
        [0, 7, 14, 21],
        [41, 34, 27, 20],
        [1, 8, 15, 22],
        [40, 33, 26, 19],
        [2, 9, 16, 23],
        [39, 32, 25, 18],
        [3, 10, 17, 24],
        [38, 31, 24, 17],
        [4, 11, 18, 25],
        [37, 30, 23, 16],
        [5, 12, 19, 26],
        [36, 29, 22, 15],
        [6, 13, 20, 27],
        [35, 28, 21, 14],
        [0, 8, 16, 24],
        [41, 33, 25, 17],
        [7, 15, 23, 31],
        [34, 26, 18, 10],
        [14, 22, 30, 38],
        [27, 19, 11, 3],
        [35, 29, 23, 17],
        [6, 12, 18, 24],
        [28, 22, 16, 10],
        [13, 19, 25, 31],
        [21, 15, 9, 3],
        [20, 26, 32, 38],
        [36, 30, 24, 18],
        [5, 11, 17, 23],
        [37, 31, 25, 19],
        [4, 10, 16, 22],
        [2, 10, 18, 26],
        [39, 31, 23, 15],
        [1, 9, 17, 25],
        [40, 32, 24, 16],
        [9, 7, 25, 33],
        [8, 16, 24, 32],
        [11, 7, 23, 29],
        [12, 18, 24, 30],
        [1, 2, 3, 4],
        [5, 4, 3, 2],
        [8, 9, 10, 11],
        [12, 11, 10, 9],
        [15, 16, 17, 18],
        [19, 18, 17, 16],
        [22, 23, 24, 25],
        [26, 25, 24, 23],
        [29, 30, 31, 32],
        [33, 32, 31, 30],
        [36, 37, 38, 39],
        [40, 39, 38, 37],
        [7, 14, 21, 28],
        [8, 15, 22, 29],
        [9, 16, 23, 30],
        [10, 17, 24, 31],
        [11, 18, 25, 32],
        [12, 19, 26, 33],
        [13, 20, 27, 34]
    ];

    io.on('connection', socket => {
        /**
         * Create new game
         * @returns { number } status
         * 0 - Created successfully
         * 1 - Data not provided
         * @returns { number | undefined } roomId
         */
        socket.on('new game', (data, cb) => {
            if (data.username) {
                let roomId;
                let moves = [];
    
                // Generate room id
                do  roomId = makeId(6);
                while (rooms.some(r => r.roomId == roomId));

                // Create moves
                for (let i = 42; i < 49; i++) {
                    moves.push({
                        player: null,
                        square: i
                    });
                }
    
                // Add data to rooms
                rooms.push({
                    roomId: roomId,
                    users: [data.username],
                    turn: data.username,
                    moves: moves
                });
    
                // Join room
                socket.join(roomId);

                // Send room id
                cb({ status: 0, roomId: roomId });
            } else {
                cb({ status: 1 });
            }
        });

        /**
         * Join game
         * @returns { number } status
         * 0 - Joined successfully
         * 1 - Username already exists
         * 2 - Full room
         * 3 - Room does not exists
         * 4 - Data not provided
         */
        socket.on('join game', (data, cb) => {
            if (data.username && data.roomId) {
                const room = rooms.filter(room => room.roomId == data.roomId)[0];

                if (room) {
                    if (room.users.length < 2) {
                        if (!room.users.includes(data.username)) {
                            // Add to room
                            room.users.push(data.username);

                            // Join room
                            socket.join(data.roomId);

                            // Emit start game message to room
                            io.in(room.roomId).emit('start game', {
                                roomId: room.roomId,
                                turn: room.users[0]
                            });

                            cb({ status: 0 });
                        } else {
                            cb({ status: 1 });
                        }
                    } else {
                        cb({ status: 2 });
                    }
                } else {
                    cb({ status: 3 });
                }
            } else {
                cb({ status: 4 });
            }
        });

        /**
         * Select square
         * @returns { number } status
         * 0 - Move successfully
         * 1 - Incorrect square
         * 2 - Square already selected
         * 3 - Wrong player
         * 4 - Game has finished
         * 5 - Room does not exists
         * 6 - Player or room id not provided
         * 7 - Wrong selected square
         */
        socket.on('select square', (data, cb) => {
            const { selected, player, roomId } = data;
            
            if (Number.isInteger(selected) && selected >= 0 && selected < 42) {
                if (player && roomId) {
                    const room = rooms.filter(room => room.roomId == data.roomId)[0];

                    if (room) {
                        // Get current turn
                        const { turn, winner } = room;

                        if (!winner) {
                            if (turn === player) {
                                if (!room.moves.find(e => e.square === selected)) {
                                    if (room.moves.find(e => e.square === selected + 7)) {
                                        // Set move
                                        room.moves.push({
                                            player: turn,
                                            square: selected
                                        });
            
                                        // Set next turn
                                        const next = (room.users.indexOf(turn) + 1) % 2;
                                        const nextTurn = room.users[next];
                                        room.turn = nextTurn;
    
                                        // Emit square selected
                                        io.in(roomId).emit('set square', {
                                            status: 0,
                                            turn: nextTurn,
                                            selected: selected,
                                            turnNo: next
                                        });
    
                                        // Check for win
                                        const win = checkForWin(roomId, player);
                                        if (win) {
                                            // Save winner
                                            room.winner = true;
    
                                            // Emit winner
                                            io.in(roomId).emit('player win', {
                                                player: player
                                            });
                                        }
    
                                        cb({
                                            status: 0,
                                            turn: nextTurn,
                                            selected: selected,
                                            turnNo: next
                                        });
                                    } else {
                                        cb({
                                            status: 1
                                        });
                                    }
                                } else {
                                    cb({
                                        status: 2
                                    });
                                }
                            } else {
                                cb({
                                    status: 3
                                });
                            }
                        } else {
                            cb({
                                status: 4
                            });
                        }
                    } else {
                        cb({
                            status: 5
                        });
                    }
                } else {
                    cb({
                        status: 6
                    });
                }
            } else {
                cb({
                    status: 7
                });
            }
        });

        socket.on('disconnect', () => {});

        /**
         * Create random id
         * @returns { string } res
         */
        function makeId(length) {
            let res = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
            for (let i = 0; i < length; i++) {
                res += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            
            return res;
        }

        /**
         * Check for player win in room
         * @param { string } roomId
         * @param { string } player
         */
        function checkForWin(roomId, player) {
            const { moves } = rooms.filter(room => room.roomId == roomId)[0];

            for (let i = 0; i < winningArray.length; i++) {
                const win = winningArray[i];
                let correct = 0;

                for (let j = 0; j < win.length; j++) {
                    if (moves.find(e => e.square === win[j] && e.player === player)) correct++;
                }
                
                if(correct === 4) return true;
            }

            return false;
        }
    });
};

module.exports = handler;