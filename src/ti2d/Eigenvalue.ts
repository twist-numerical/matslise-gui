import Problem from "./Problem";

export default class Eigenvalue {
  public index: number;
  public value: number;
  public error: number;
  public multiplicity: number;
  public problem: Problem;
  public visible: boolean = false;
  public eigenfunctions: number[][][] | null = null;
  public calculatingEigenfunction: boolean = false;

  constructor(
    eigen: {
      index: number;
      value: number;
      error: number;
      multiplicity: number;
    },
    problem: Problem
  ) {
    this.index = eigen.index;
    this.value = eigen.value;
    this.multiplicity = eigen.multiplicity;
    this.error = eigen.error;
    this.problem = problem;
  }

  public async ensureEigenfunctions() {
    if (!this.calculatingEigenfunction && this.eigenfunctions === null) {
      this.calculatingEigenfunction = true;
      this.eigenfunctions = await this.problem.eigenfunction(this.value);
    }
  }
}
