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
const captureCountAll = document.getElementById("capture-count-all");

const user2 = "tomasquinones";
const user = "DrNykterstein"; // Magnus Carlsen
// const user = "TSMFTXH"; // Hikaru Nakamura

//const user = "gameofsquares";
//lichess.org/api/games/user/${user}
userName.innerText = user;
const URL = `https://lichess.org/api/games/user/${user}?perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence&max=500`;
//const URL = `sample.pgn`;

function renderGraph(data, divId, captureCount) {
    //TODO: Add the layout updates to change graph colors and padding
    let graphData = [
        {
            type: "heatmap",
            colorscale: "Portland",
            z: data,
            x: ["A", "B", "C", "D", "E", "F", "G", "H"],
            y: ["1", "2", "3", "4", "5", "6", "7", "8"],
            hovertemplate: "Captures %{z}",
        },
    ];
    let layout = {
        margin: { t: 25, b: 25, r: 25, l: 25 },
        paper_bgcolor: "#DCDCDC",
    };
    Plotly.newPlot(divId, graphData, layout);
}

function findCaptures(games, piece, divId) {
    // Set up the initial 2D array of squares, with each square having an
    // initial value of zero. This way we are guaranteed to have exactly the
    // right number of squares in the output.
    let squares = [];
    let captureCount = 0;

    for (let x = 0; x < 8; ++x) {
        squares[x] = [];
        for (let y = 0; y < 8; ++y) {
            squares[x][y] = 0;
        }
    }

    // For each match, increment the correct square
    let startXOrd = "a".codePointAt(0);
    for (const game of games) {
        let playerWhite = true;
        game.white == user ? (playerWhite = true) : (playerWhite = false);

        for (const move of game.moves) {
            move.piece == undefined ? (move.piece = "P") : move.piece;
            if (
                //move.file &&
                //move.rank &&
                move.capture &&
                move.white == playerWhite &&
                piece.includes(move.piece)
            ) {
                console.log("move.piece", move.piece);
                // We get the x index by determining the distance between the left-most
                // square's letter ('a') and the letter for this match.
                let x = move.file.codePointAt(0) - startXOrd;

                // Y is already just a number, so parse it, then offset it so it's
                // zero-indexed.
                let y = Number(move.rank) - 1;

                // console.log("match", match, "x", x, "y", y)
                squares[x][y]++;
                captureCount++;
            }
        }
    }
    console.log(`total captures by ${piece} `, captureCount);
    // Our data is already in the expected format
    renderGraph(squares, divId, captureCount);
}

// -------------------------------------------------------
// Game Classes!
class Game {
    constructor(rawData) {
        let splitData = rawData.split("\n\n");
        const metadata = splitData[0].split("\n");
        let moveText = splitData[1];
        const metaRegex = /\[(\w+)\s"(.*)"\]/;

        for (const item of metadata) {
            // console.log("item", item);
            let match = item.match(metaRegex);
            if (match) {
                let key = match[1].toLowerCase();
                let value = match[2];
                this[key] = value;
            }
        }

        const resultRegex = /\s+(0-1|1-0|1\/2-1\/2|\*)$/;
        moveText = moveText.replace(resultRegex, "");

        const moveRegex =
            /(?<turn>\d+)\.\s(?<white>\S+)((?<!#)\s(?<black>\S+))?/g;

        this.moves = [];

        for (const match of moveText.matchAll(moveRegex)) {
            const groups = match.groups;
            this.moves.push(new Move(groups.turn, true, groups.white));
            if (groups.black) {
                this.moves.push(new Move(groups.turn, false, groups.black));
            }
        }
    }
}

class Move {
    constructor(turn, white, rawData) {
        this.turn = turn;
        this.white = white;
        const moveRegex =
            /((?<piece>[RNBQK])?(?<disambiguator>[a-h])?(?<capture>x)?(?<file>[a-h])(?<rank>[1-8])(?<promotion>=[RNBQ])?(?<checks>[+#])?)|(?<castle>O-O(-O)?)/;
        const match = rawData.match(moveRegex);

        Object.assign(this, match.groups);
    }
}

fetch(URL)
    .then((response) => response.text())
    .then((text) => {
        const arrayOfGameInstances = text
            .split("\n\n\n")
            .filter((text) => text.length > 0)
            .map((gameData) => {
                return new Game(gameData);
            });

        console.log("arrayOfGameInstances", arrayOfGameInstances);
        //const allMoves = arrayOfGameInstances.map((game) => game.moves).join();

        findCaptures(
            arrayOfGameInstances,
            ["P", "R", "N", "B", "Q", "K"],
            capturesAll
        );
        findCaptures(arrayOfGameInstances, ["P"], capturesByPawns);
        findCaptures(arrayOfGameInstances, ["R"], capturesByRooks);
        findCaptures(arrayOfGameInstances, ["N"], capturesByKnights);
        findCaptures(arrayOfGameInstances, ["B"], capturesByBishops);
        findCaptures(arrayOfGameInstances, ["Q"], capturesByQueens);
        findCaptures(arrayOfGameInstances, ["K"], capturesByKings);
    });
