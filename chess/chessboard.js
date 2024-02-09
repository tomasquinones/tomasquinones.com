const board = document.getElementById("board");

const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
//const columns = ["a"];

function elementFromHTML(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}

isWhite = false;

for (let rank = 1; rank <= 8; rank++) {
    const newRank = document.createElement("div");
    newRank.classList.add("rank", `rank${rank}`);

    for (file in columns) {
        const square = elementFromHTML(
            `<div id='${columns[file]}${rank}' class='squares ${
                isWhite ? "white" : "black"
            }' >${columns[file]}${rank}</div>`
        );
        newRank.insertAdjacentElement("beforeend", square);
        isWhite = !isWhite; //sets the next square to !current color
    }
    board.insertAdjacentElement("afterbegin", newRank);
    isWhite = !isWhite; //starts the next rank to be the same as last color of previoius rank
}
