import Cell from './cell.js';
import UI from './ui.js';

const cellStatusEl = document.getElementById('cellStatus');
const cellContentEl = document.getElementById('cellContent');
const resetBtnEl = document.getElementById('resetBtn');
const exportBtnEl = document.getElementById('exportBtn');
const rowHeaderEl = document.getElementById('rowHeader');
const columnHeaderEl = document.getElementById('columnHeader');
const sheetContainerEl = document.getElementById('sheetContainer');
const sheetScrollEl = document.querySelector('.spread-sheet');

const defaultRows = 50;
const defaultCols = 40;
const alphabets = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];

// 스프레드 시트 초기화
const spreadSheet = new Array(defaultRows).fill()
    .map((_row, rowIdx) => new Array(defaultCols).fill()
        .map((_col, colIdx) => new Cell(
            // data, row, column, rowName, columnName
            null, (rowIdx + 1), (colIdx + 1), String(rowIdx + 1), 
            alphabets[colIdx % alphabets.length].repeat(parseInt(colIdx / alphabets.length) + 1)
        ))
    );
let lastCell = [1, 1];

// 기본 셀 이벤트 모음 객체
const basicEvent = {
    eventTypingInput(inputEl) {
        const [ row, column ] = lastCell;
        spreadSheet[row - 1][column - 1].data = inputEl.value ? inputEl.value : null;
        cellContentEl.value = spreadSheet[row - 1][column - 1].data;
    },
    
    keyEventOfCell(e) {
        const keyState = e.shiftKey || e.ctrlKey || e.metaKey || e.altKey;
        const [ row, column ] = lastCell;
        if (!keyState && e.key == 'ArrowUp') {
            if (row == 1) return false;
            const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${row - 1}-${column}"]`);
            targetCell.firstChild.focus();
            selectCell(targetCell);
        } else if (!keyState && e.key == 'ArrowDown') {
            if (row == spreadSheet.length) return false;
            const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${row + 1}-${column}"]`);
            targetCell.firstChild.focus();
            selectCell(targetCell);
        } else if (!keyState && e.key == 'ArrowLeft') {
            if (column == 1) return false;
            const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${row}-${column - 1}"]`);
            targetCell.firstChild.focus();
            selectCell(targetCell);
        } else if (!keyState && e.key == 'ArrowRight') {
            if (column == spreadSheet[0].length) return false;
            const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${row}-${column + 1}"]`);
            targetCell.firstChild.focus();
            selectCell(targetCell);
        }
    },

    activeCellFocus(e) {
        if (e.key == 'Enter') {
            const [ row, column ] = lastCell;
            const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${row}-${column}"] > input`);
            targetCell.focus();
        }
    },
}

// 시트 로딩 함수
function loadSheet() {
    // init container
    columnHeaderEl.innerHTML = '';
    rowHeaderEl.innerHTML = '';
    sheetContainerEl.innerHTML = '';

    // insert HTML
    spreadSheet.forEach((colArr, rowIdx) => {
        const cellHTML = colArr.reduce((htmlArr, cell, colIdx) => {
            if (colIdx === rowIdx) columnHeaderEl.innerHTML += UI.colHeaderHTML(cell);
            if (colIdx === 0) rowHeaderEl.innerHTML += UI.rowHeaderHTML(cell);
            return (htmlArr.push(UI.cellHTML(cell, selectCell, basicEvent)), htmlArr);
        }, ([]));
        sheetContainerEl.append(UI.cellWrapHTML(cellHTML));
    });

}
loadSheet();

// 기본 하이라이트 설정
document.querySelector('.spread-sheet__cell').classList.add('spread-sheet__cell--highlight');
document.querySelector('.spread-sheet__colHeaderCell').classList.add('spread-sheet__colHeaderCell--highlight');
document.querySelector('.spread-sheet__rowHeaderCell').classList.add('spread-sheet__rowHeaderCell--highlight');

// 셀 선택 이벤트 (셀 이벤트 및 셀 이름 인풋 요소 접근)
function selectCell(cellEl) {
    if (lastCell?.length) {
        const [ lastRow, lastColumn ] = lastCell;
        const lastActiveCol = document.getElementById(`colHeader_${lastColumn}`);
        const lastActiveRow = document.getElementById(`rowHeader_${lastRow}`);
        const lastCellEl = document.querySelector(`.spread-sheet__cell[data-cell-index="${lastRow}-${lastColumn}"]`);
        lastActiveCol?.classList.remove('spread-sheet__colHeaderCell--highlight');
        lastActiveRow?.classList.remove('spread-sheet__rowHeaderCell--highlight');
        lastCellEl?.classList.remove('spread-sheet__cell--highlight');
    }
    const { cellName, cellIndex } = cellEl?.dataset;
    const [ row, column ] = cellIndex.split('-').map(Number);
    const targetCol = document.getElementById(`colHeader_${column}`);
    const targetRow = document.getElementById(`rowHeader_${row}`);
    targetCol?.classList.add('spread-sheet__colHeaderCell--highlight');
    targetRow?.classList.add('spread-sheet__rowHeaderCell--highlight');
    
    cellEl?.classList.add('spread-sheet__cell--highlight');
    cellStatusEl.value = cellName;
    cellContentEl.value = spreadSheet[row - 1][column - 1].data;
    lastCell = [ row, column ];
}

// 엔터 키 이벤트 > 활성화 된 셀의 인풋에 포커스 줌
window.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {basicEvent.activeCellFocus(e)}
});

// 셀 이름 접근 관련 이벤트
cellStatusEl.addEventListener('keydown', (e) => {
    const [ row, column ] = lastCell;
    if (e.key == 'Escape') {
        const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${row}-${column}"]`);
        cellStatusEl.blur();
        cellStatusEl.value = targetCell.dataset.cellName;
    } else if (e.key == 'Enter') {
        const [ _input, colName, rowName ] = cellStatusEl.value.match(/([A-Za-z]+)(\d+)/);
        const alphabetsIndex = alphabets.indexOf(colName[0].toUpperCase());
        if (alphabetsIndex > -1 && Number(rowName) > 0) {
            const targetColumn = (alphabetsIndex + (colName.length - 1) * alphabets.length + 1);
            const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${rowName}-${targetColumn}"]`);
            selectCell(targetCell);
        } else {
            const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${row}-${column}"]`);
            cellStatusEl.blur();
            cellStatusEl.value = targetCell.dataset.cellName;
        };
    }
});

// 상단 셀 콘텐츠 인풋 이벤트
cellContentEl.addEventListener('input', () => {
    const [ row, column ] = lastCell;
    const targetCell = document.querySelector(`.spread-sheet__cell[data-cell-index="${row}-${column}"] > input`);
    targetCell.setAttribute('value', cellContentEl.value);
    targetCell.value = cellContentEl.value;
    spreadSheet[row - 1][column - 1].data = cellContentEl.value;
});

// 리셋 버튼 이벤트
resetBtnEl.addEventListener('click', () => {
    const confirmTxt = '초기화 시 현재까지 작성된 모든 데이터가 삭제되며, \n다시는 복구할 수 없습니다 \n초기화 하시겠습니까?';
    if (confirm(confirmTxt)) location.reload();
});

// 내보내기 버튼 이벤트
exportBtnEl.addEventListener('click', () => {
    const csv = spreadSheet.map((rowEl) => {
        return rowEl.map((cell) => cell.data ?? ' ').join(',');
    }).join(',\r\n');

    const csvObj = new Blob([csv]);
    const csvUrl = URL.createObjectURL(csvObj);
    const anchorEl = document.createElement('a');
    anchorEl.href = csvUrl;
    anchorEl.download = 'PBL04_SpreadSheet.csv';
    anchorEl.click();
});

// 가로 스크롤 이벤트
sheetScrollEl.addEventListener('scroll', (e) => {
    const { left } = sheetContainerEl?.getBoundingClientRect();
    rowHeaderEl.style.left = Math.abs(left - 59) + "px";
});