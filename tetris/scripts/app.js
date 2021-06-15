window.oncontextmenu = function () {
    return false;
}
document.onkeydown = function (e) {
    if (window.event.keyCode == 123 ||  e.button==2)
        return false;
}

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const canvasScore = document.getElementById('score');
const contextScore = canvasScore.getContext('2d');

const grid = 32

const recordRef = db.collection("Record").doc("keISDAunYB67rvMdNV0J")

let figureSequence = []
let playField = []

let score = 0;
let record = 0;
let level = 1;
let recordName = '';
let name = '';

let maxLength = 4;

while (name == '' || (name != null && name.length > maxLength)) {
    name = prompt('Please enter your nickname. It should be no more than ' + maxLength + ' characters in length');
}


recordRef.get().then((doc) => {
    if (doc.exists) {
        if (doc.data().record !== null) {
            record = doc.data().record
            recordName = doc.data().recordName
        }
    } else {
        console.log("No such document!");
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});

fillPlayField()

function fillPlayField() {
    for (let row = -2; row < 20; row++) {
        playField[row] = [];

        for (let col = 0; col < 10; col++) {
            playField[row][col] = 0;
        }
    }
}

const figures = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'O': [
        [1, 1],
        [1, 1]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'T': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'E': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ]
}

const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange',
    'E': 'deepPink'
}

let count = 0;
let tick = 0;
let figure = getNextFigure();
let rAF = null;
let gameOver = false;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z', 'E'];

    while (sequence.length) {
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];
        figureSequence.push(name);
    }
}

function getNextFigure() {
    if (figureSequence.length === 0) {
        generateSequence();
    }
    const name = figureSequence.pop();
    const matrix = figures[name];

    const col = playField[0].length / 2 - Math.ceil(matrix[0].length / 2);

    const row = name === 'I' ? -1 : -2;

    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col
    };
}

function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i]));
    return result;
}

function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playField[0].length ||
                cellRow + row >= playField.length ||
                playField[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }
    return true;
}

function placeFigure() {
    for (let row = 0; row < figure.matrix.length; row++) {
        for (let col = 0; col < figure.matrix[row].length; col++) {
            if (figure.matrix[row][col]) {
                if (figure.row + row < 0) {
                    if (score >= record && ((score / 10) === tick)) {
                        recordRef.set({
                            record: record,
                            recordName: recordName
                        })
                    } else if (!(score / 10) === tick) {
                        alert('!!!!CHEATS DETECTED!!!!')
                    }
                    return showGameOver();
                }

                playField[figure.row + row][figure.col + col] = figure.name;
            }
        }
    }
    for (let row = playField.length - 1; row >= 0;) {
        if (playField[row].every(cell => !!cell)) {
            score += 10;
            tick += 1;
            if (score > record && ((score / 10) === tick)) {
                record = score
                recordName = name
            } else if (!(score / 10) === tick) {
                alert('!!!!CHEATS DETECTED!!!!')
            }

            level = Math.floor(score / 100) + 1;
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playField[r].length; c++) {
                    playField[r][c] = playField[r - 1][c];
                }
            }
        } else {
            row--;
        }
        figure = getNextFigure();
    }
}

function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 70);
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    context.font = '12px monospace';
    context.fillText("Press space to restart", canvas.width / 2, canvas.height / 2 + 25);
}

function showScore() {
    contextScore.clearRect(0, 0, canvasScore.width, canvasScore.height);
    contextScore.globalAlpha = 1;
    contextScore.fillStyle = 'white';
    contextScore.font = '18px Courier New'
    contextScore.fillText('Level: ' + level, 15, 20);
    contextScore.fillText('Score: ' + score, 15, 50);
    contextScore.fillText('Champion: ' + recordName, 160, 20);
    contextScore.fillText('Record: ' + record, 160, 50);
}

function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playField[row][col]) {
                const name = playField[row][col];
                context.fillStyle = colors[name];

                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    if ((score / 10) !== tick && score >= 10) {
        alert("!!!!CHEATS DETECTED!!!!")
    }

    if (figure) {

        if (++count > (36 - level)) {
            figure.row++;
            count = 0;

            if (!isValidMove(figure.matrix, figure.row, figure.col)) {
                figure.row--;
                placeFigure();
            }
        }

        context.fillStyle = colors[figure.name];

        for (let row = 0; row < figure.matrix.length; row++) {
            for (let col = 0; col < figure.matrix[row].length; col++) {
                if (figure.matrix[row][col]) {

                    context.fillRect((figure.col + col) * grid, (figure.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }
    }

    showScore()
}

document.addEventListener('keydown', function (e) {
    let NAVIGATION = [37, 38, 39, 40]

    if (-1 != NAVIGATION.indexOf(event.keyCode))
        event.preventDefault();

    if (e.which === 37 || e.which === 39) {
        const col = e.which === 37 ? figure.col - 1 : figure.col + 1;
        if (isValidMove(figure.matrix, figure.row, col)) {
            figure.col = col;
        }
    }

    if (e.which === 38) {
        const matrix = rotate(figure.matrix);
        if (isValidMove(matrix, figure.row, figure.col)) {
            figure.matrix = matrix;
        }
    }
    if (e.which === 40) {
        const row = figure.row + 1;

        if (!isValidMove(figure.matrix, row, figure.col)) {
            figure.row = row - 1;
            placeFigure();
            return;
        }
        figure.row = row;
    }

    if (e.which === 32 && gameOver === true) {
        score = 0;
        level = 1;
        playField = []
        tick = 0;
        fillPlayField()
        gameOver = false;
        rAF = requestAnimationFrame(loop);
    }
})

rAF = requestAnimationFrame(loop);

