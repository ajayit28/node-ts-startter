import fs from 'fs';
import { IConfig, ISess } from './cinterface';
import { ServerLogging } from './logging';
/**
 * Configuration Class which reads the config and prepares config object.
 */
export class ServerConfig {

    // private logging: ILogging = new ServerLogging('ServerConfig');
    private sess: ISess = new ISess('ServerConfig');
    private configFileName: string = './serverconfig.json';

    public static serverConfig: IConfig;

    public static THRESHOLD_DAYS_EXPIRY_DEFAULT = 7;

    constructor() {
        this.sess = new ISess('Processing Server Configs');
        this.readConfig();
        this.sess.finish();

    }

    /**
     * Kept private function so that no one else has access to it.
     */
    private readConfig(): void {
        try {
            this.sess.log('Reading the config');
            const configFromFileContent = fs.readFileSync(this.configFileName, 'utf-8');
            // this.sess.log(`Config - ${configFromFileContent}`);
            ServerConfig.serverConfig = JSON.parse(configFromFileContent);
            this.sess.log(`Done reading config`);
        } catch (error) {
            this.sess.log('Error while reading the server config file. Please make sure file exists and has a proper json content.');
            this.sess.log(error.message);
        }
    }

}