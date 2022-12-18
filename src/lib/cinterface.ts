import express from 'express'
/**
 * Interface for custom logging
 */
 export interface ILogging {
  log(message: any): void;
  debug(message: any): void;
  warn(message: any): void;
  error(message: any): void;
}

export interface IConfig {
  port: number | 4001;
  debug: boolean | false;
}

export class ISess {
  public cmd = '';
  public logMem = '';
  private ts = Date.now();

  constructor(cmd?: string) {
      this.cmd = cmd || '';
  }
  public log(...args: any[]) {
      let space = '  [+' + (Date.now() - this.ts) + 'ms] ';
      for (const arg of args) {
          this.logMem += space + (arg && arg.toString());
          space = ' ';
      }
      this.logMem += '\n';
  }
  public finish() {
      console.log(new Date(this.ts).toJSON() + ' (' + (Date.now() - this.ts) + 'ms) ' +
          this.cmd + '\n' + this.logMem);
  }
}

declare global {
  namespace Express {
    interface Request {
      sess: ISess; // for request session logging
      start_ts: number;
    }
  }
}

// export interface Request extends express.Request { 
  
// }