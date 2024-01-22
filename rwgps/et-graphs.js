import { bradReber, zackHam } from "./riders.js";

let authToken = localStorage.getItem("auth_token");
console.log(authToken);

if (authToken) {
  fetchData();
}

function signOut() {
  localStorage.clear();
  document.getElementById("content-container").style.display = "none";
  document.getElementById("sign-in").style.display = "block";
}

function requestData(url, authToken) {
  const authHeaders = new Headers();
  if (authToken) {
    authHeaders.append("x-rwgps-auth-token", authToken);
  }
  authHeaders.append("x-rwgps-api-key", "aa49d17b");
  authHeaders.append("x-rwgps-api-version", "3");

  const request = new Request(url, {
    headers: authHeaders,
  });
  return fetch(request).then((response) => response.json());
}

function speedAtGrade(array) {
  const a = array.map((item) => [Number(item[0]), item[1][0] * 0.621371]);
  a.sort((a, b) => a[0] - b[0]);
  const aSpeeds = a.map((item) => Number(item[1]));
  return aSpeeds;
}

function paceAtGrade(array) {
  const a = array.map((item) => [
    Number(item[0]),
    60 / (item[1][0] * 0.621371),
  ]);
  a.sort((a, b) => a[0] - b[0]);
  const paces = a.map((item) => Number(item[1]));
  return paces;
}

function pointsAtGrade(array) {
  const q = array.map((item) => [Number(item[0]), item[1][1]]);
  q.sort((a, b) => a[0] - b[0]);
  return q;
}

function fetchData() {
  // document.getElementById('sign-in').style.display = 'none';
  let userUrl = null;
  if (!authToken) {
    const email = document.getElementById("emailForm").value;
    const password = document.getElementById("passwordForm").value;
    userUrl = `https://ridewithgps.com/users/current.json?email=${email}&password=${password}`;
  } else {
    userUrl = `https://ridewithgps.com/users/current.json`;
  }

  requestData(userUrl, authToken)
    .then((userData) => {
      localStorage.setItem("auth_token", userData.user.auth_token);
      authToken = localStorage.getItem("auth_token");
      console.log("userData", userData.user.user_summary);

      const userSummary = Object.entries(userData.user.user_summary);

      const speeds = speedAtGrade(userSummary);
      const zackSpeeds = speedAtGrade(zackHam);

      const paces = paceAtGrade(userSummary);
      // const zackPaces = paceAtGrade(zackHam);

      //const quantities = pointsAtGrade(userSummary);

      const errorBars = pointsAtGrade(userSummary).map((n) => {
        return (2 * 2) / Math.sqrt(n[1]);
      });

      let grades = [];
      for (let d = -15; d < 16; d++) {
        grades.push(d);
      }

      // Graph Me, speed with error bars
      let graphSpeedWithErrorBars = [
        {
          x: grades,
          y: speeds,
          error_y: {
            type: "data",
            array: errorBars,
            visible: true,
          },
          type: "scatter",
        },
      ];

      const etGraph = document.getElementById("et-graph");
      Plotly.newPlot(etGraph, graphSpeedWithErrorBars);

      // Graph me pace with error bars
      let graphPaceWithErrorBars = [
        {
          x: grades,
          y: paces,
          error_y: {
            type: "data",
            array: errorBars,
            visible: true,
          },
          type: "scatter",
        },
      ];

      const paceGraph = document.getElementById("pace-graph");
      Plotly.newPlot(paceGraph, graphPaceWithErrorBars);

      // Compare Speeds at Grade to Pace at Grade
      var lineSpeeds = {
        x: grades,
        y: speeds,
        name: "Speed(mph)",
        type: "scatter",
      };
      var linePaces = {
        x: grades,
        y: paces,
        name: "Pace (mins/mile)",
        type: "scatter",
      };
      var compareGraphLayout = {
        title: "Speed vs Pace",
        xaxis: {
          title: "Grades",
        },
        yaxis: {
          title: "Speed and Pace",
        },
      };
      var compareGraphData = [lineSpeeds, linePaces];
      Plotly.newPlot("compare-graph", compareGraphData, compareGraphLayout);

      //Compare compare-against-zack
      var lineSpeeds2 = {
        x: grades,
        y: speeds,
        name: "Me",
        type: "scatter",
      };
      var lineZackSpeeds = {
        x: grades,
        y: zackSpeeds,
        name: "Zack",
        type: "scatter",
      };
      var compareZackGraphLayout = {
        title: "Speed vs Pace",
        xaxis: {
          title: "Grades",
        },
        yaxis: {
          title: "Speed",
        },
      };
      var compareZackGraphData = [lineSpeeds2, lineZackSpeeds];
      Plotly.newPlot(
        "compare-against-zack",
        compareZackGraphData,
        compareZackGraphLayout
      );
    })
    .then();
}
