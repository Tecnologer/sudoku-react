import * as React from "react";
import "../App.css";

export interface CoordinateProps {
  width: string;
  x: number;
  y: number;
  value: number;
}

export interface CoordinateState {
  x: number;
  y: number;
}

class Coordinate extends React.Component<CoordinateProps, CoordinateState> {
  state = { x: -1, y: -1 };
  render() {
    var { width, x, y, value } = this.props;
    console.log(x, y);
    this.setState({ x: x, y: y });
    return (
      <span
        style={{ width: width, height: width, background: "red" }}
        className="coordinate"
      >
        {value}
      </span>
    );
  }
}

export default Coordinate;
