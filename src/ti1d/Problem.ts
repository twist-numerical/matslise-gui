import { i } from "mathjs";
import MatsliseModule, {
  AbstractMatslise,
  MatsliseHalf,
  Eigenfunction,
  Matslise,
  SturmLiouville,
} from "../lib/matslise";
import { evalAll, evalFunction, evalVal } from "./evaluate";

export default class Problem {
  public Matslise: typeof Matslise | null = null;
  public MatsliseHalf: typeof MatsliseHalf | null = null;
  public SturmLiouville: typeof SturmLiouville | null = null;
  public matslise: AbstractMatslise | SturmLiouville | null = null;
  public parsed: {
    p: (x: number) => number;
    q: (x: number) => number;
    w: (x: number) => number;
    x: [number, number];
    ymin: [number, number];
    ymax: [number, number];
    left: [number, number];
    right: [number, number];
    tolerance: number;
    symmetric: boolean;
    schrodinger: boolean;
  } | null = null;

  public p = "1";
  public q = "0";
  public w = "1";
  public x: [string, string] = ["0", "pi"];
  public ymin: [string, string] = ["1", "0"];
  public ymax: [string, string] = ["1", "0"];
  public tolerance = "1e-8";
  public symmetric = false;
  public toDelete: { delete: () => void }[] = [];

  constructor() {
    this.initMatslise();
  }

  hardReset() {
    this.reset();
    this.Matslise = null;
    this.MatsliseHalf = null;
    this.SturmLiouville = null;
    this.initMatslise();
  }

  initMatslise() {
    new MatsliseModule().then((module) => {
      this.Matslise = module.Matslise;
      this.MatsliseHalf = module.MatsliseHalf;
      this.SturmLiouville = module.SturmLiouville;
    });
  }

  setMatslise() {
    const parsed = this.parsed;
    if (!parsed || !this.MatsliseHalf || !this.Matslise || !this.SturmLiouville)
      return;

    if (parsed.schrodinger) {
      if (parsed.symmetric) {
        this.matslise = new this.MatsliseHalf(
          parsed.q,
          parsed.x[1],
          parsed.tolerance
        );
      } else {
        this.matslise = new this.Matslise(
          parsed.q,
          parsed.x[0],
          parsed.x[1],
          parsed.tolerance
        );
      }
    } else {
      this.matslise = new this.SturmLiouville(
        parsed.p,
        parsed.q,
        parsed.w,
        parsed.x[0],
        parsed.x[1],
        parsed.tolerance
      );
    }
    this.toDelete.push(this.matslise);
  }

  parse() {
    if (this.Matslise === null || this.MatsliseHalf === null)
      throw new Error("Wait until problem.Matslise !== null");
    if (this.matslise !== undefined) this.reset();

    const ifSymmetric = (f: (x: number) => number): ((x: number) => number) => {
      if (this.symmetric) return (x) => f(Math.abs(x));
      return f;
    };

    const ymin = evalAll(this.ymin);
    const ymax = evalAll(this.ymax);
    const x = evalAll(this.x);
    this.parsed = {
      p: ifSymmetric(evalFunction(this.p)),
      q: ifSymmetric(evalFunction(this.q)),
      w: ifSymmetric(evalFunction(this.w)),
      x: this.symmetric ? [-x[1], x[1]] : x,
      ymin: this.symmetric ? ymax : ymin,
      ymax,
      left: this.symmetric ? [ymax[1], -ymax[0]] : [ymin[1], -ymin[0]],
      right: [ymax[1], -ymax[0]],
      tolerance: evalVal(this.tolerance),
      symmetric: this.symmetric,
      schrodinger: this.p == "1" && this.w == "1",
    };
    this.setMatslise();
  }

  reset() {
    this.parsed = null;
    this.matslise = null;
    for (const obj of this.toDelete.splice(0, this.toDelete.length))
      obj.delete();
  }

  eigenpairsByIndex(
    imin: number,
    imax: number
  ): { index: number; eigenvalue: number; eigenfunction: Eigenfunction }[] {
    if (this.matslise === null || this.parsed === null) this.parse();
    const eigenpairs = this.matslise!.eigenpairsByIndex(
      imin,
      imax,
      this.parsed!.left,
      this.parsed!.right
    );
    eigenpairs.forEach(({ eigenfunction }) =>
      this.toDelete.push(eigenfunction)
    );
    return eigenpairs;
  }

  eigenvalueError(index: number, E: number): number {
    if (this.matslise === null || this.parsed === null) this.parse();
    return this.matslise!.eigenvalueError(
      E,
      this.parsed!.left,
      this.parsed!.right,
      index
    );
  }
}
