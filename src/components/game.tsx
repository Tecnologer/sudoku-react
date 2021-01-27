import "../App.css";
import * as React from "react";
import Board from "./board";
import { ICoordinate } from "../models/iCoordinate";
import { IGame, IGameRes, IGameButton } from "../models/iGame";
import { http } from "../utils/http";

export interface GameProps {}

export interface GameState {
  game: IGame;
  buttons: IGameButton[];
}

class Game extends React.Component<GameProps, GameState> {
  state = {
    game: {} as IGame,
    buttons: Array<IGameButton>(),
  };

  boardRef = React.createRef<Board>();
  constructor(props: GameProps) {
    super(props);

    this.state.game.board = this.getEmptyBoard();
    this.state.buttons[0] = { level: "easy", label: "New Easy" } as IGameButton;

    this.getLevels();
  }

  render() {
    return (
      <div>
        <div className="game">
          <Board content={this.state.game.board} ref={this.boardRef} />
        </div>
        <div style={{ paddingTop: "5px" }}>
          {this.state.buttons.map((btn) => {
            return (
              <button
                onClick={() => this.getContent(btn.level)}
                style={{ paddingLeft: "5px" }}
              >
                {btn.label}
              </button>
            );
          })}
          {/* <button onClick={() => this.getContent("easy")}>New Easy</button>
          <button onClick={() => this.getContent("medium")}>New medium</button> */}
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.boardRef.current?.newBoard(this.getEmptyBoard());
  }

  getContent = async (level: string) => {
    // let board: string[][] = [
    //   ["3", "", "", "5", "", "", "", "6", "9"],
    //   ["4", "", "2", "", "", "", "", "", ""],
    //   ["", "", "5", "", "6", "", "8", "7", ""],
    //   ["", "", "", "1", "", "2", "", "", "7"],
    //   ["", "", "1", "", "", "", "3", "", ""],
    //   ["7", "", "", "9", "", "4", "", "", ""],
    //   ["", "2", "9", "", "1", "", "6", "", ""],
    //   ["", "", "", "", "", "", "4", "", "8"],
    //   ["5", "3", "", "", "", "6", "", "", "2"],
    // ];

    const resp = await http<IGameRes>("api/game?level=" + level);

    const board: ICoordinate[][] = this.parseContentToCoordinates(resp.board);
    this.setState({
      game: {
        board: board,
        level: resp.level,
        start_time: resp.start_time,
        locked_coordinates: resp.locked_coordinates,
      },
    });

    this.boardRef.current?.newBoard(board);
  };

  parseContentToCoordinates = (content: number[][]) => {
    let coordinates: ICoordinate[][] = [];
    content.forEach((row, x) => {
      coordinates[x] = [];
      row.forEach((col, y) => {
        coordinates[x][y] = {
          x: x,
          y: y,
          val: col === 0 ? "" : col.toString(),
          isLocked: col !== 0,
        };
      });
    });

    return coordinates;
  };

  getEmptyBoard = () => {
    const emptyBoard: number[][] = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    return this.parseContentToCoordinates(emptyBoard);
  };

  getLevels = async () => {
    const levelsStr = await http<string[]>("api/game/levels");
    let levels: Array<IGameButton> = [];
    let level: number = 0;
    for (let i: number = 0; i < levelsStr.length; i++) {
      if (levelsStr[i] === "Invalid" || levelsStr[i] === "Test") {
        continue;
      }

      levels[level] = { level: levelsStr[i], label: "New " + levelsStr[i] };
      level++;
    }

    if (levels.length > 0) {
      this.setState({ buttons: levels });
    }
  };
}

export default Game;
