
process.env.TZ = 'UTC';

import { ServerConfig } from './lib/config';
import cluster from 'cluster';
import { ILogging } from './lib/cinterface';
import { ServerLogging } from './lib/logging';
import Server from './server'

const logging: ILogging = new ServerLogging('Server');
let isServerStopCmdCalled: boolean = false;

process.on('warning', (warning) => {
    console.warn('********* WARNING ERROR *********');
    console.warn(warning.name); // Print the warning name
    console.warn(warning.message); // Print the warning message
    console.warn(warning.stack); // Print the stack trace
    console.warn('********* WARNING ERROR ENDS *********');
});

require('console-stamp')(console, {
    colors: {
        stamp: 'yellow',
        label: 'white',
        metadata: 'green',
    },
    pattern: 'yyyy-mm-dd HH:MM:ss Z',
});


if (cluster.isMaster) {

    logging.log('Spawning a thread');
    cluster.fork();

    cluster.on('exit', function (worker, code, signal) {
        if (isServerStopCmdCalled) {
            logging.log('worker ' + worker.process.pid + ' stopped');
        } else {
            logging.log('worker ' + worker.process.pid + ' died');

            setTimeout(function () {
                if (isServerStopCmdCalled == false) {
                    logging.log('Restarting process');
                    cluster.fork();
                }
            }, 2000); // wait 3 seconds and restart process
        }
    });

    process.on('SIGINT', async () => {
        isServerStopCmdCalled = true;
        setTimeout(() => {
            logging.log('Agent Master exiting now..');
            process.exit(0);
        }, 100);
    });

} else {

    // initialize the server config
    new ServerConfig();
    const serverConfig = ServerConfig.serverConfig;

    logging.debug(serverConfig);

    // initialize the server for web
    new Server();


    process.on('SIGINT', async () => {

        logging.log('[Server][Shutdown] Received SIGINT. Performing cleanups.');
        logging.log('[Server][Shutdown] All cleanup done, exiting now..');

        process.exit(0);
    });
}

;