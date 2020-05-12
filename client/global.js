let clickRow = -1;
let clickCol = -1;

let connection = {};

function allowDrop(ev) {
    ev.preventDefault();
}

function clickField(ev) {
    if(clickCol < 0 && clickRow < 0){
        clickRow = Number(ev.target.getAttribute("data-row"));
        clickCol = Number(ev.target.getAttribute("data-col"));

        game.showTargets(clickRow, clickCol);
    } else {
        const sourceRow = clickRow;
        const sourceCol = clickCol;

        const targetRow = Number(ev.target.getAttribute("data-row"));
        const targetCol = Number(ev.target.getAttribute("data-col"));

        game.move(sourceRow, sourceCol, targetRow, targetCol);

        clickRow = -1;
        clickCol = -1;
    }

    ev.preventDefault();
}

function drag(ev) {

    const row = Number(ev.target.getAttribute("data-row"));
    const col = Number(ev.target.getAttribute("data-col"));

    if (ev.dataTransfer) {
        ev.dataTransfer.setData("row", row);
        ev.dataTransfer.setData("col", col);
    } 

    game.showTargets(row, col);
}

function drop(ev) {
    ev.preventDefault();

    if (ev.dataTransfer) {
        const sourceRow = ev.dataTransfer.getData("row");
        const sourceCol = ev.dataTransfer.getData("col");

        const targetRow = Number(ev.target.getAttribute("data-row"));
        const targetCol = Number(ev.target.getAttribute("data-col"));

        game.move(sourceRow, sourceCol, targetRow, targetCol);
    }
}
