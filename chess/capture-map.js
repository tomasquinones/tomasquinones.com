const playerName = document.getElementById("player");
const captureMap = document.getElementById("capture-map");
const gamesList = document.getElementById("games");

const user = "tomasquinones";
const URL = `https://lichess.org/api/games/user/${user}`;
let data = "";

function renderGraph2(data) {
  let graphData = [
    {
      //z: data,
      z: [
        [1, 2, 3, 4, 5, 6, 7, 8],
        [3, 4, 3, 5, 3, 6, 7, 8],
        [4, 5, 6, 7, 3, 5, 3, 2],
        [4, 5, 4, 6, 3, 3, 7, 6],
        [5, 6, 4, 4, 3, 5, 6, 6],
        [3, 4, 3, 5, 6, 7, 5, 4],
        [5, 7, 5, 7, 5, 7, 5, 4],
        [2, 3, 5, 6, 7, 6, 7, 8],
      ],
      x: ["A", "B", "C", "D", "E", "F", "G", "H"],
      y: ["1", "2", "3", "4", "5", "6", "7", "8"],
      type: "heatmap",
    },
  ];
  Plotly.newPlot(captureMap, graphData);
}

debug_graphData = [];
function renderGraph(AofA) {
  let graphData = [
    {
      z: AofA,

      x: ["A", "B", "C", "D", "E", "F", "G", "H"],
      y: ["1", "2", "3", "4", "5", "6", "7", "8"],
      type: "heatmap",
    },
  ];
  debug_graphData = graphData;
  Plotly.newPlot(captureMap, graphData);
}

function algebraToX(a) {
  return a.codePointAt(0) - "a".codePointAt(0);
}

function algebraToY(a) {
  return a.codePointAt(1) - "0".codePointAt(0) - 1;
}

function XtoAlgebra(x) {
  return String.fromCodePoint("a".codePointAt(0) + x - 1);
}
function YtoAlgebra(y) {
  return String.fromCodePoint("0".codePointAt(0) + y);
}

function squaresToAofA(s) {
  let aofa = [];
  for (i = 1; i <= 8; ++i) {
    let a = [];
    for (j = 1; j <= 8; ++j) {
      algebra = XtoAlgebra(i) + YtoAlgebra(j);
      //console.log(algebra);
      a.push(s[algebra] || 0);
    }
    aofa.push(a);
  }
  return aofa;
}

let matches = [];
let graphData = [];
let squares = {};
let coords = [];
const regex = /x([a-hA-H][1-8])/gm;

fetch(URL)
  .then((response) => response.text())
  .then((text) => {
    //matches = data.match(regex);
    for (m of text.matchAll(regex)) {
      let square = m[1];
      if (!squares[square]) {
        squares[square] = 1;
      } else {
        squares[square] += 1;
      }
      renderGraph(squaresToAofA(squares));
    }

    coords = [];
    for (i = 0; i < 8; ++i) {
      row = [];
      for (j = 0; j < 8; ++j) {
        row.push(0);
      }
      coords.push(row);
    }

    for (m of text.matchAll(regex)) {
      let square = m[1];
      let x = algebraToX(square);
      let y = algebraToY(square);
      coords[x][y]++;
      renderGraph(squaresToAofA(squares));
    }

    console.log("squares", squares);

    console.log("graphData", graphData);
    // renderGraph();
  });
