export interface IMessageRes {
    message: string;
    status: number;
}

export interface IValidateErrsRes{
    errors: { [type: string]: Array<ICoordinateRes> };
    count: number;
}

export interface ICoordinateRes{
    x: number;
    y: number;
}