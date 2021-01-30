import "../App.css";
import React, { FocusEvent } from "react";
import Board from "./board";
import { ICoordinate } from "../models/iCoordinate";
import { IGame, IGameRes, IGameButton } from "../models/iGame";
import { http } from "../utils/http";
import { format } from "react-string-format";
import { IMessageRes, IValidateErrsRes } from "../models/httpResponses";
import { timeStamp } from "console";

export interface GameProps {}

export interface GameState {
  game: IGame;
  buttons: IGameButton[];
  error: string;
}

class Game extends React.Component<GameProps, GameState> {
  state = {
    error: "",
    game: {} as IGame,
    buttons: Array<IGameButton>(),
  };

  boardRef = React.createRef<Board>();
  constructor(props: GameProps) {
    super(props);

    this.state.game.board = this.getEmptyBoard();
    this.state.buttons[0] = { level: "easy", label: "New Easy" } as IGameButton;
  }

  render() {
    return (
      <div>
        <div style={{ padding: "8px" }}>
          {this.state.buttons.map((btn) => {
            return (
              <button
                key={"btn_" + btn.label.replace(" ", "")}
                onClick={() => this.getContent(btn.level)}
                style={{ marginLeft: "5px" }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
        <div className="game">
          <Board
            content={this.state.game.board}
            ref={this.boardRef}
            onSetValue={this.onSetValue}
          />
        </div>
        <div>
          <button style={{ marginTop: "5px" }} onClick={this.validateGame}>
            Check
          </button>
        </div>
        <div>
          <span className="error-message">{this.state.error}</span>
        </div>
      </div>
    );
  }

  componentDidMount() {
    // this.boardRef.current?.newBoard(this.getEmptyBoard());
    this.getContent("empty");
    this.getLevels();
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

    const resp = await http<IGameRes>(
      format("api/game?level={0}", level === "" ? "empty" : level)
    );

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
          hasError: false,
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

  onSetValue = async (event: FocusEvent<HTMLInputElement>) => {
    const coors = event.target.id.split(",");
    const x = coors[0];
    const y = coors[1];
    const n = event.target.value || "0";

    const url = format("api/game/set?x={0}&y={1}&n={2}", x, y, n);
    const res = await http<IMessageRes | IGameRes>(url);

    const err = res as IMessageRes;
    if (err.status !== undefined && err.status !== 200) {
      this.setState({ error: err.message });
      return;
    }
    const gameUpdated = res as IGameRes;
    let currentGame = this.state.game;
    currentGame.board = this.parseContentToCoordinates(gameUpdated.board);

    this.setState({ game: currentGame });
  };

  clearError = () => {
    setTimeout(() => {
      this.setState({ error: "" });
    }, 10000);
  };

  validateGame = async () => {
    const url = format("api/game/validate");
    const errs = await http<IValidateErrsRes>(url);

    this.boardRef.current?.clearErrors();

    if (errs === undefined || errs.count === 0) return;

    for (let errType in errs.errors) {
      errs.errors[errType].forEach((e) => {
        if (errType === "column") {
          this.boardRef.current?.setColError(e.y, true);
        } else if (errType === "row") {
          this.boardRef.current?.setRowError(e.x, true);
        } else if (errType === "square") {
          this.boardRef.current?.setSquareError(e.x, e.y, true);
        }
      });
    }
  };
}

export default Game;
