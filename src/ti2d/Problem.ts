// @ts-ignore
import WorkerPromise from "webworker-promise";

interface HistoryEntry {
  name: string;
  time: number | null;
}

export default class Problem {
  public potential = "(1+x^2)*(1+y^2)";
  public x: [string, string] = ["-5.5", "5.5"];
  public y: [string, string] = ["-5.5", "5.5"];
  public tolerance = "1e-5";
  public xSymmetric = true;
  public ySymmetric = false;
  public worker: WorkerPromise;
  public potentialData: number[][];

  public ready: boolean = false;
  public calculating: boolean = false;
  public parsed: null | {
    tolerance: number;
    x: [number, number];
    y: [number, number];
    xPoints: number[];
    yPoints: number[];
    xSymmetric: boolean;
    ySymmetric: boolean;
  } = null;
  private historyID: number = 0;
  public history: HistoryEntry[] = [];

  constructor() {
    this.startWorker();
  }

  startWorker() {
    if (this.worker === undefined) {
      this.worker = new WorkerPromise(new Worker("./worker.ts"));
      this.worker.postMessage({ type: "isReady" }).then((ready: boolean) => {
        this.ready = ready;
      });
    } else {
      console.error("Worker already started");
    }
  }

  terminate() {
    this.worker.terminate();
    this.worker = undefined;
    this.ready = false;
    this.calculating = false;
    this.parsed = null;
    this.startWorker();
  }

  async parse() {
    this.parsed = await this.startCalculation(
      this.addToHistory(
        `Initialising problem`,
        this.worker.postMessage({
          type: "parse",
          data: {
            potential: this.potential,
            x: this.x,
            y: this.y,
            tolerance: this.tolerance,
            xSymmetric: this.xSymmetric,
            ySymmetric: this.ySymmetric,
          },
        })
      )
    );
    this.potentialData = await this.startCalculation(
      this.worker.postMessage({
        type: "evaluatePotential",
      })
    );
  }

  reset() {
    if (this.calculating) this.terminate();
    this.parsed = null;
  }

  async startCalculation(action: Promise<any>): Promise<any> {
    this.calculating = true;
    const result = await action;
    this.calculating = false;
    return result;
  }

  async addToHistory(name: string, action: Promise<any>): Promise<any> {
    const entry: HistoryEntry = {
      name,
      time: 0,
    };
    const currentHistoryID = ++this.historyID;
    this.history.push(entry);
    const start = +new Date();
    const updateTime = setInterval(() => {
      if (currentHistoryID != this.historyID) clearInterval(updateTime);
      else entry.time = +new Date() - start;
    }, 1000);
    const result = await action;
    clearInterval(updateTime);
    entry.time = +new Date() - start;
    return result;
  }

  async eigenvaluesByIndex(
    imin: number,
    imax: number
  ): Promise<[number, number][]> {
    return await this.startCalculation(
      this.addToHistory(
        `Eigenvalues`,
        this.worker.postMessage({
          type: "eigenvaluesByIndex",
          data: { imin, imax },
        })
      )
    );
  }

  async eigenfunction(E: number): Promise<number[][][]> {
    return await this.startCalculation(
      this.addToHistory(
        `Eigenfunction of ${E.toPrecision(4)}`,
        this.worker.postMessage({
          type: "eigenfunction",
          data: { E },
        })
      )
    );
  }
}
