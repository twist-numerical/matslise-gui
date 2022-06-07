import Problem from "./Problem";
import Color = require("color");
import { Eigenfunction } from "../lib/matslise";

export interface Eigenvalue {
  index: number;
  value: number;
  error: number;
  visible: boolean;
  color: string;
  eigenfunction: Eigenfunction;
  readonly eigenfunctionValues: number[];
  _eigenfunctionValues?: number[];
}

export default class Controller {
  public eigenvalues: Eigenvalue[] | null = null;
  public problem = new Problem();
  public xValues: number[] = [];
  public errors: string[] = [];

  reset() {
    this.errors = [];
    this.problem.reset();
    this.eigenvalues = null;
  }

  execute<F extends any[]>(f: (...args: F) => void, ...args: F): void {
    try {
      f(...args);
    } catch (e) {
      if (e instanceof WebAssembly.RuntimeError) {
        console.error(e);
        this.errors.push(
          `A webassembly error occured. It could help to increase the tolerance.`
        );
        this.problem.hardReset();
      } else {
        throw e;
      }
    }
  }

  calculate() {
    this.execute(() => {
      this.reset();
      this.eigenvalues = [];
      this.problem.parse();
      this.xValues = [];
      const n = 189;
      const [xmin, xmax] = this.problem.parsed!.x;
      for (let i = 0; i < n; ++i) {
        this.xValues.push(
          i === 0
            ? xmin
            : i === n - 1
            ? xmax
            : xmin + ((xmax - xmin) * (i + Math.random())) / n
        );
      }
      this.moreEigenvalues();
      this.eigenvalues[0].visible = true;
      this.eigenvalues[1].visible = true;
    });
  }

  moreEigenvalues() {
    this.execute(() => {
      const self = this;
      const start = this.eigenvalues!.length;
      const end = this.eigenvalues!.length + 10;
      const eigenvalues = this.problem.eigenpairsByIndex(start, end);
      if (eigenvalues.length != end - start)
        this.errors.push(
          `Not all eigenvalues between indices ${start} and ${end} were found.`
        );
      let prevIndex =
        this.eigenvalues!.length == 0
          ? -1
          : this.eigenvalues![this.eigenvalues!.length - 1].index;
      for (const { index, eigenvalue: value, eigenfunction } of eigenvalues) {
        if (index > prevIndex + 1) {
          this.errors.push(
            `Missing eigenvalue found before ${index}: ${value.toPrecision(5)}`
          );
        } else if (index <= prevIndex) {
          this.errors.push(
            `Duplicate eigenvalue found ${index}: ${value.toPrecision(5)}`
          );
        }
        prevIndex = index;
        this.eigenvalues!.push({
          index,
          value,
          eigenfunction,
          error: this.problem.eigenvalueError(index, value),
          visible: false,
          color: Color.hsv(1.61803398875 * index * 100, 100, 80).string(),
          get eigenfunctionValues(): number[] {
            if (this._eigenfunctionValues) return this.eigenfunctionValues;
            return (this._eigenfunction = eigenfunction(self.xValues).map(
              ([f, df]) => f
            ));
          },
        });
      }
    });
  }
}
