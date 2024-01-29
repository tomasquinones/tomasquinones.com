const playerName = document.getElementById("player");
const captureMap = document.getElementById("capture-map");
const gamesList = document.getElementById("games");

const user = "tomasquinones";
// const user = "gameofsquares";
const URL = `https://lichess.org/api/games/user/${user}?perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence`;
let data = "";

function renderGraph(data) {
    let graphData = [
        {
            z: data,
            x: ["A", "B", "C", "D", "E", "F", "G", "H"],
            y: ["1", "2", "3", "4", "5", "6", "7", "8"],
            type: "heatmap",
        },
    ];
    Plotly.newPlot(captureMap, graphData);
}

const regex = /x[a-hA-H][1-8]/gm;

fetch(URL)
    .then((response) => response.text())
    .then((text) => {
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

        // For each match, increment the correct square
        let startXOrd = "a".codePointAt(0);
        for (matches of text.matchAll(regex)) {
            // There should only be one match, since we have no groups.  The first
            // character is always 'x', so we ignore it. The second character (idx 1)
            // is the X coordinate, and the third character (idx 2) is the Y
            // coordinate.
            let match = matches[0];

            // We get the x index by determining the distance between the left-most
            // square's letter ('a') and the letter for this match.
            let x = match.codePointAt(1) - startXOrd;

            // Y is already just a number, so parse it, then offset it so it's
            // zero-indexed.
            let y = Number(match[2]) - 1;

            // console.log("match", match, "x", x, "y", y)
            squares[x][y]++;
        }

        console.log("squares", squares);
        // Our data is already in the expected format
        renderGraph(squares);
    });
