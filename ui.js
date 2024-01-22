export default class UI {
    static colHeaderHTML(cell) {
        return `
            <p id="colHeader_${cell?.column}" class="spread-sheet__colHeaderCell">${
                cell?.cellName.match(/([A-Za-z]+)/)[1]
            }</p>
        `;
    }
    static rowHeaderHTML(cell) {
        return `
            <p id="rowHeader_${cell?.row}" class="spread-sheet__rowHeaderCell">${cell?.row}</p>
        `;
    }
    static cellWrapHTML(cellElArr) {
        const cellRow = document.createElement('div');
        cellRow.className = 'spread-sheet__cellRow';
        cellElArr.forEach(cellEl => cellRow.append(cellEl));

        return cellRow;
    }
    static cellHTML(cell, cellFunc, event) {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'spread-sheet__cell';
        cellDiv.setAttribute('data-cell-name', cell?.cellName);
        cellDiv.setAttribute('data-cell-index', `${cell?.row}-${cell?.column}`);

        const cellInput = document.createElement('input');
        cellInput.type = 'text';
        cellInput.value = cell?.data ?? '';
        cellInput.addEventListener('input', (e) => event.eventTypingInput(cellInput));
        
        cellDiv.append(cellInput);
        cellDiv.addEventListener('click', (e) => cellFunc(cellDiv));
        cellDiv.addEventListener('keydown', (e) => event.keyEventOfCell(e));

        return cellDiv;
    }
}