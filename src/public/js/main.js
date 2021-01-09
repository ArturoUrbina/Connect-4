const socket = io();
let currentRoomId;

// Start game
socket.on('start game', (data) => {
    const { turn, roomId } = data;

    // Set current room id
    currentRoomId = roomId;

    // Hide connecting wrap
    $("#connectingWrap").addClass("d-none");

    // Set turn
    $("#turn").text("Turno de " + turn);

    // Create game board
    createGameBoard();

    // Set squares listener
    const squares = Array.from(document.querySelectorAll("#gameBoard div"));
    squares.forEach(square => {
        square.addEventListener("click", clickSquare);
    });

    // Show game wrap
    $("#gameWrap").removeClass("d-none");
});

// Set square
socket.on('set square', (data) => {
    const { turn, turnNo, selected } = data;
    
    // Set turn
    $("#turn").text("Turno de " + turn);

    // Get square
    const square = $(`#${selected}`);
    
    if (turnNo === 0) square.attr("class", "player-one taken");
    else if (turnNo === 1) square.attr("class", "player-two taken");
});

// Player win
socket.on('player win', (data) => {
    const { player } = data;

    // Show win message
    Swal.fire({
        icon: 'success',
        title: 'Ganador',
        text: 'El jugador ' + player + ' ganó',
        timer: 2000,
        showConfirmButton: false
    });
});

// Submit user data
$("#userData").on("submit", function (e) {
    // Prevent default
    e.preventDefault();

    // Get data
    const username = $("#username");
    const roomId = $("#roomId");
    const roomCheck = $("#roomCheck");

    // Emit message
    if (roomCheck.prop("checked") && username.val()) {
        // Emit new game message
        socket.emit('join game', {
            username: username.val(),
            roomId: roomId.val()
        }, (data) => {
            const { status } = data;
            if (status === 0) {
                $("#usernameWrap").addClass("d-none");
            } else if (status === 1) {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Nombre de usuario tomado',
                    text: 'Elige otro nombre de usuario para unirte',
                    timer: 3000,
                    showConfirmButton: false
                });
            } else if (status === 2) {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Juego lleno',
                    text: 'No te puedes unir porque el juego está lleno',
                    timer: 3000,
                    showConfirmButton: false
                });
            } else if (status === 3) {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Código no válido',
                    text: 'El código que ingresaste no es válido',
                    timer: 3000,
                    showConfirmButton: false
                });
            } else if (status === 4) {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Faltan datos',
                    text: 'Ingresa un nombre y un código para empezar a jugar',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        });
    } else if (username.val()) {
        // Emit new game message
        socket.emit('new game', {
            username: username.val()
        }, (data) => {
            const { status } = data;
            if (status === 0) {
                // Show connecting wrap
                $("#usernameWrap").addClass("d-none");
                $("#showRoomId").val(data.roomId);
                $("#connectingWrap").removeClass("d-none");
            } else if (status === 1) {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Faltó el nombre',
                    text: 'Ingresa un nombre para empezar a jugar',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        });
    }
});

// Show/hide room input
$("#roomCheck").on("click", function () {
    if (this.checked) {
        $("#roomId").parent().removeClass("d-none");
    } else {
        $("#roomId").parent().addClass("d-none");
    }
});

/**
 * Create game board
 */
function createGameBoard() {
    const gameBoard = $("#gameBoard");

    for (let i = 0; i < 49; i++) {
        // Create square
        const div = document.createElement("div");

        // Set data id and id
        div.setAttribute("data-id", i);
        div.setAttribute("id", i);

        // Set class name
        div.className = "square";
        if (i >= 42) {
            div.className = "taken";
        }

        // Append to game board
        gameBoard.append(div);
    }
}

/**
 * Send clicked square
 */
function clickSquare() {
    // Get selected square
    const selected = parseInt(this.dataset.id);
    const username = $("#username");

    // Emit selected square
    socket.emit('select square', {
        selected: selected,
        player: username.val(),
        roomId: currentRoomId
    }, (data) => {
        const { status } = data;

        if (status === 0) {
        } else if (status === 1) {
            // Show warning message
            Swal.fire({
                icon: 'warning',
                title: 'No se puede tirar ahí',
                text: 'Escoge una casilla válida',
                timer: 2000,
                showConfirmButton: false
            });
        } else if (status === 2) {
            // Show warning message
            Swal.fire({
                icon: 'warning',
                title: 'No se puede tirar ahí',
                text: 'Esa casilla ya está ocupada',
                timer: 2000,
                showConfirmButton: false
            });
        } else if (status === 3) {
            // Show warning message
            Swal.fire({
                icon: 'warning',
                title: 'No es tu turno',
                text: 'Espera a que sea tu turno para tirar',
                timer: 2000,
                showConfirmButton: false
            });
        } else if (status === 4) {
            // Show warning message
            Swal.fire({
                icon: 'info',
                title: 'Partida terminada',
                text: 'La partida ha terminado',
                timer: 2000,
                showConfirmButton: false
            });
        } else if (status === 5) {
            // Show warning message
            Swal.fire({
                icon: 'error',
                title: 'Error en la partida',
                text: 'Ocurrió un error, por favor intenta jugar más tarde',
                timer: 2000,
                showConfirmButton: false
            });

            // Reload window
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else if (status === 6) {
            // Show warning message
            Swal.fire({
                icon: 'error',
                title: 'Error en la partida',
                text: 'Ocurrió un error, por favor intenta jugar más tarde',
                timer: 2000,
                showConfirmButton: false
            });

            // Reload window
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else if (status === 7) {
            // Show warning message
            Swal.fire({
                icon: 'error',
                title: 'No existe esa casilla',
                text: 'No se puede tirar fuera del tablero',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}
