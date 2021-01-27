import { ICoordinate } from "./iCoordinate"

export interface IGame {
    board: ICoordinate[][];
    level: string;
    start_time: Date;
    locked_coordinates: ICoordinate[];
}

export interface IGameRes {
    board: number[][];
    level: string;
    start_time: Date;
    locked_coordinates: ICoordinate[];
}

export interface IGameButton{
    level: string;
    label: string;
}