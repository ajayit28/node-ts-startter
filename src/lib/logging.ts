import cluster from 'cluster';
import {ServerConfig} from './config';
import {ILogging} from './cinterface'

/**
 * Customized logging class for the application.
 * Usage - 
 * Initialize the class with `callingClass` and use the instance to call `log`, `debug`, `warn`, `error` functions. 
 * `callingClass` name is a unique name to identify the log.
 * 
 * A sample log would be - 
 * 
 * ```[29.01.2021 06:20.12.141] [LOG]   [W][ServerScheduler] number_of_devices - 500```
 * 
 * Format is -
 * 
 * ```[Date] [Log level] [Worker or Master] [CallinClass] the log message```
 */
export class ServerLogging implements ILogging {
    public callerName: string;
    public processPrefix: string;
    constructor(callingClass: string) {
        this.callerName = '[' + callingClass + '] ';
        this.processPrefix = cluster.isMaster ? '[M]' : '[W]';
    }
    public log(message: any): void {
        message = message instanceof Object ? JSON.stringify(message) : message;
        console.log(this.processPrefix + this.callerName + message);
    }
    public debug(message: any): void {
        if (ServerConfig.serverConfig && ServerConfig.serverConfig['debug']) {
            message = message instanceof Object ? JSON.stringify(message) : message;
            console.debug(this.processPrefix + this.callerName + message);
        }
    }
    public warn(message: any): void {
        message = message instanceof Object ? JSON.stringify(message) : message;
        console.warn(this.processPrefix + this.callerName + message);
    }
    public error(message: any): void {
        message = message instanceof Object ? JSON.stringify(message) : message;
        console.error(this.processPrefix + this.callerName + message);
    }
}