const playerName = document.getElementById("player");
const capturesAll = document.getElementById("captures-by-all");
const capturesByPawns = document.getElementById("captures-by-pawns");
const capturesByRooks = document.getElementById("captures-by-rooks");
const capturesByKnights = document.getElementById("captures-by-knights");
const capturesByBishops = document.getElementById("captures-by-bishops");
const capturesByQueens = document.getElementById("captures-by-queens");
const capturesByKings = document.getElementById("captures-by-kings");
const gamesList = document.getElementById("games");
const userName = document.getElementById("user-name");

const user = "tomasquinones";
userName.innerText = user;
//const user = "gameofsquares";
const URL = `https://lichess.org/api/games/user/${user}?perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence&max=100`;
//const URL = `https://lichess.org/api/games/user/${user}`;

function renderGraph(data, divId) {
    //TODO: Add the layout updates to change graph colors and padding
    let graphData = [
        {
            z: data,
            x: ["A", "B", "C", "D", "E", "F", "G", "H"],
            y: ["1", "2", "3", "4", "5", "6", "7", "8"],
            type: "heatmap",
        },
    ];
    Plotly.newPlot(divId, graphData);
}

const regexAll = /x([a-h][1-8])/gm;
const regexPawns = /[a-h]x([a-h][1-8])/gm;
const regexRooks = /Rx([a-h][1-8])/gm;
const regexKnights = /Nx([a-h][1-8])/gm;
const regexBishops = /Bx([a-h][1-8])/gm;
const regexQueens = /Qx([a-h][1-8])/gm;
const regexKings = /Kx([a-h][1-8])/gm;

function findCaptures(text, re, divId) {
    // Set up the initial 2D array of squares, with each square having an
    // initial value of zero. This way we are guaranteed to have exactly the
    // right number of squares in the output.
    let squares = [];
    for (let x = 0; x < 8; ++x) {
        squares[x] = [];
        for (let y = 0; y < 8; ++y) {
            squares[x][y] = 0;
        }
    }
    console.log("Empty Squares Array Created", squares);

    // For each match, increment the correct square
    let startXOrd = "a".codePointAt(0);
    for (matches of text.matchAll(re)) {
        // There should only be one match, since we have no groups.  The first
        // character is always 'x', so we ignore it. The second character (idx 1)
        // is the X coordinate, and the third character (idx 2) is the Y
        // coordinate.
        let match = matches[1];

        // We get the x index by determining the distance between the left-most
        // square's letter ('a') and the letter for this match.
        let x = match.codePointAt(0) - startXOrd;

        // Y is already just a number, so parse it, then offset it so it's
        // zero-indexed.
        let y = Number(match[1]) - 1;

        // console.log("match", match, "x", x, "y", y)
        squares[x][y]++;
    }
    //console.log(re, squares);
    // Our data is already in the expected format
    renderGraph(squares, divId);
}

fetch(URL)
    .then((response) => response.text())
    .then((text) => {
        findCaptures(text, regexAll, capturesAll);
        findCaptures(text, regexPawns, capturesByPawns);
        findCaptures(text, regexRooks, capturesByRooks);
        findCaptures(text, regexKnights, capturesByKnights);
        findCaptures(text, regexBishops, capturesByBishops);
        findCaptures(text, regexQueens, capturesByQueens);
        findCaptures(text, regexKings, capturesByKings);
    });
