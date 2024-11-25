// let graph;

// let promise = new Promise(() => {
//     graph = document.querySelector("[class^='progress_']");
// });

// promise.then(() => {
//     console.log(graph);
//     graph.innerHTML = "test";
//     graph.addEventListener("mouseover", () => {
//         graph.innerHTML = "mouseover";
//     });
// });

function updateGraph() {
    let graph = document.querySelector("[class^='progress_']");
    graph.style.backgroundColor = "red";
    graph.classList.add("goal_box");
    graph.innerHTML = "This is where the graph will go";

    console.log("graph drawn?");
}

// document.body.addEventListener("mouseover", updateGraph);

//setTimeout(updateGraph, "2000");

updateGraph();
