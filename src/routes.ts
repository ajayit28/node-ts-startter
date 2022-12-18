import { Router, Express, Request, Response } from "express";
import { ServerLogging } from "./lib/logging";
import { ILogging } from  './lib/cinterface';
export class Routes {
  public router: Router;
  private logging: ILogging = new ServerLogging('Routes');

  constructor(app: Express) {
    this.router = app;
    this.router.get('/', (req: Request, res: Response) => {
      req.sess.log('Express + TypeScript Server Start');
      res.send('Express + TypeScript Server');
      req.sess.log('Express + TypeScript Server End');
    });
  }
  
}