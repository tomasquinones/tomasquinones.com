const playerName = document.getElementById("player");
const captureMap = document.getElementById("capture-map");
const gamesList = document.getElementById("games");

const user = "tomasquinones";
// const user = "gameofsquares";
const URL = `https://lichess.org/api/games/user/${user}`;
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

let matches = [];
let squares = {};
let coords = [];
const regex = /x([a-hA-H][1-8])/gm;

fetch(URL)
  .then((response) => response.text())
  .then((text) => {
    for (m of text.matchAll(regex)) {
      let square = m[1];
      if (!squares[square]) {
        squares[square] = 1;
      } else {
        squares[square] += 1;
      }
    }

    const unsortedMap = new Map(Object.entries(squares));
    const unsortedArray = [...unsortedMap];

    const sortedArray = unsortedArray.sort(([key1, value1], [key2, value2]) =>
      key1.localeCompare(key2)
    );

    //const sortedMap = new Map(sortedArray);

    coords = [];

    for (let i = 0; i < sortedArray.length; i) {
      let temp = [];
      for (let j = 0; j < 8; j++) {
        temp.push(sortedArray[i][1]);
        i++;
      }
      coords.push(temp);
    }
    console.log("coords", coords);
    renderGraph(coords);
  });
