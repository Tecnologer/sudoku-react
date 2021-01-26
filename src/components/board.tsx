import React, { ChangeEvent, KeyboardEvent, RefObject } from "react";
import { ICoordinate } from "../models/iCoordinate";
import "../App.css";

export interface BoardProps {
  content: ICoordinate[][];
}

export interface BoardState {
  content: ICoordinate[][];
}

class Board extends React.Component<BoardProps, BoardState> {
  constructor(props: BoardProps) {
    super(props);
    this.initInputRefs();
  }

  state = { content: Array<ICoordinate[]>() };
  inputRefs: RefObject<HTMLInputElement>[][] = [];

  render() {
    return (
      <div className="board">
        {this.getCoordinateFields(this.state.content)}
      </div>
    );
  }

  componentWillMount() {
    this.setState({ content: this.props.content });
  }

  getCoordinateFields = (content: ICoordinate[][]) => {
    return content.map((row, x) => {
      return (
        <div id={"row_" + x}>
          {row.map((col, y) => {
            return (
              <div
                id={"col_" + x + "_" + y}
                className={this.getCoordinateClass(x, y)}
              >
                {this.formatCell(col)}
              </div>
            );
          })}
        </div>
      );
    });
  };

  formatCell = (coor: ICoordinate) => {
    if (coor.isLocked) {
      return <span id={"cell_" + coor.x + "_" + coor.y}>{coor.val}</span>;
    }

    return (
      <input
        id={coor.x + "," + coor.y}
        type="text"
        className="coordinate-editable "
        value={coor.val}
        onChange={this.handleChange}
        ref={this.inputRefs[coor.x][coor.y]}
        onKeyDown={this.onKeyDown}
      />
    );
  };

  getCoordinateClass = (x: number, y: number) => {
    let c: string = "coordinate";

    if (y === 0) {
      c += " coordinate-start";
    } else if (y === 8) {
      c += " coordinate-end";
    } else {
      c += " coordinate-middle";
    }

    if (x === 8) {
      c += " coordinate-end-row";
    }

    if ((x + 1) % 3 === 0) {
      c += " coordinate-bolder-row";
    }
    // console.log(x, y, x % 3, y % 3);
    if ((y + 1) % 3 === 0) {
      c += " coordinate-bolder-column";
    }

    return c;
  };

  handleChange = (event: ChangeEvent<{ value: string; id: string }>) => {
    let { x, y } = this.extractCoordFromId(event.target.id);

    if (x === undefined || y === undefined) {
      return;
    }
    let content: ICoordinate[][] = this.state.content;

    content[x][y].val = event.target.value;

    this.setState({ content: content });
  };

  onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight"
    ) {
      return;
    }

    let { x, y } = this.extractCoordFromId(event.currentTarget.id);

    if (x === undefined) {
      x = 0;
    }

    if (y === undefined) {
      y = 0;
    }

    if (event.key === "ArrowDown") x++;
    else if (event.key === "ArrowUp") x--;
    else if (event.key === "ArrowLeft") y--;
    else y++;

    if (x < 0) {
      x = this.inputRefs.length - 1;
    } else if (x >= this.inputRefs.length) {
      x = 0;
    }

    if (y < 0) {
      y = this.inputRefs[x].length - 1;
    } else if (y >= this.inputRefs[x].length) {
      y = 0;
    }

    let a = this.inputRefs[x][y];
    let current = a.current;

    let x1: number = 0;
    let isOnX: boolean = event.key == "ArrowLeft" || event.key === "ArrowRight";
    let xOffset: number = event.key == "ArrowLeft" ? -1 : 1;
    let yOffset: number = event.key == "ArrowUp" ? -1 : 1;

    let pivotOffset: number = isOnX ? xOffset : yOffset;
    let pivot: number = isOnX ? y + xOffset : x + yOffset;

    if (pivot < 0) {
      pivot = 8;
    } else if (pivot > 8) {
      pivot = 0;
    }

    while (x1 < 9 && current === null) {
      current = isOnX
        ? this.inputRefs[x][pivot].current
        : this.inputRefs[pivot][y].current;

      pivot += pivotOffset;
      if (pivot < 0) {
        pivot = 8;
      } else if (pivot > 8) {
        pivot = 0;
      }
      x1++;
    }

    if (current === null) {
      return;
    }

    current.focus();
  };

  extractCoordFromId = (id: string) => {
    let idParts = id.split(",");

    if (idParts.length < 2) {
      return { x: 0, y: 0 };
    }

    return { x: Number(idParts[0]), y: Number(idParts[1]) };
  };

  initInputRefs = () => {
    this.inputRefs = [];
    for (let x: number = 0; x < 9; x++) {
      this.inputRefs[x] = [];
      for (let y: number = 0; y < 9; y++) {
        this.inputRefs[x][y] = React.createRef<HTMLInputElement>();
      }
    }

    console.log(this.inputRefs);
  };
}

export default Board;
