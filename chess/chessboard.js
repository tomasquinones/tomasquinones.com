const board = document.getElementById("board");
const selected = document.getElementById("selected");

const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

function elementFromHTML(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}

isWhite = false;

for (let rank = 1; rank <= 8; rank++) {
    const newRank = document.createElement("div");
    newRank.classList.add("rank", `rank${rank}`);

    for (let file of columns) {
        const square = elementFromHTML(
            `<div id='${file}${rank}' class='squares ${
                isWhite ? "white" : "black"
            }' >${file}${rank}</div>`
        );
        square.addEventListener(
            "click",
            (e) => (selected.innerHTML = square.getAttribute("id"))
        );
        newRank.insertAdjacentElement("beforeend", square);
        isWhite = !isWhite; //sets the next square to !current color
    }
    board.insertAdjacentElement("afterbegin", newRank);
    isWhite = !isWhite; //starts the next rank to be the same as last color of previoius rank
}

console.log(columns);
