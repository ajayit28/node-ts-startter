import express, {Request, Response} from 'express';
import { ServerConfig } from './lib/config';
import { Routes } from './routes';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { ServerLogging } from './lib/logging';
import { ILogging, ISess } from './lib/cinterface';
import morgan from 'morgan';
import fs from 'fs';



/**
 * Class to prepare Express Server app.
 */
export default class Server {
    static logging: ILogging = new ServerLogging('ServerConfig');
    static actionLogging: ILogging = new ServerLogging('ACTION');

    constructor() {
        Server.logging.log("Starting Admin Server");


        const app = express();
        app.disable("x-powered-by"); // security compliance, hiding what tech is used to develop the app

        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());

        app.use(express.static(path.join(__dirname, './public')));
        // cookie parsing
        app.use(cookieParser());
       
        // trusting first proxy, may be because it is behind nginx?? 
        app.set('trust proxy', 1);
        // // setting up the session
        app.use(session({
            secret: '!THIS_@#IS_@#$FAS_MY_SPECIAL_SECRET_@$%234%^@^$%',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                maxAge: 1000 * 60 * 60 
            }
        }));

        if (!fs.existsSync(__dirname + '/logs')) {
            fs.mkdirSync(__dirname + '/logs');
        }
        // create a write stream (in append mode)
        const accessLogStream = fs.createWriteStream(path.join(__dirname + '/logs/', 'access_admin.log'), { flags: 'a' })

        // setup the logger
        app.use(morgan(
            '[:date[clf]] :remote-addr - :remote-user  HTTP/:http-version "Ref :referrer" ":user-agent" :method :url :status :response-time ms'
            , { stream: accessLogStream }));


        // all user action logging.
        app.use(function (req: Request, res: Response, next) {
            const session_: any = req.session;
            req.start_ts = Date.now();
            req.sess = new ISess(`Request: ${req.path}`);
            
            res.on('close', () => {
                req.sess.log(`Request ${req.path} Served in ${Date.now() - req.start_ts}ms`);
                req.sess.finish();
            });
            next()
        });


        new Routes(app);
        if(ServerConfig.serverConfig && ServerConfig.serverConfig.port) {
          // staring to listen now..
        app.listen(ServerConfig.serverConfig.port, function () {
          Server.logging.log(`Server started at ${ServerConfig.serverConfig.port}`);
      });
        }

        
    }
}


