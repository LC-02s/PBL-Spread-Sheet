export default class Cell {
    constructor(data, row, column, rowName, columnName, disabled = true, active = false) {
        this.data = data;
        this.row = row;
        this.column = column;
        this.cellName = columnName + rowName;
        this.coordinate = [this.row, this.column];
        this.disabled = disabled;
        this.active = active;
    }
}