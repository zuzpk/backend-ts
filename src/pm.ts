import { Logger } from '@/lib/logger';
import { ChildProcess, spawn } from 'child_process';
import chokidar, { FSWatcher } from 'chokidar';
import fs from 'fs';
import path from 'path';

class ProcessManager {

    private appName: string;
    private script: string;
    private pidFile: string;
    private process: ChildProcess | null = null;
    private watcher: FSWatcher | null = null;
    private restartTimeout: NodeJS.Timeout | null = null;
    private isDevMode: boolean;

    constructor(appName: string, script: string, isDevMode: boolean) {
        this.appName = appName;
        this.script = script;
        this.pidFile = path.join(__dirname, `..`, `${appName}.pid`);
        this.isDevMode = isDevMode;
    }

    public startApp() {
        this.startProcess();
        if (this.isDevMode) {
          this.watchFiles();
        }
    }
    
    private startProcess() {
        Logger.error(`Starting ${this.appName}...`);
        this.process = spawn('node', [this.script], {
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: this.isDevMode ? 'development' : 'production' },
        });
    
        // Save the PID to a file
        if (this.process && this.process.pid) {
            console.log(`Started ${this.appName} with PID ${this.process.pid}`);
            fs.writeFileSync(this.pidFile, this.process.pid.toString());
        }
    
        this.process.on('exit', (code) => {
          if (code !== 0) {
            Logger.error(`${this.appName} crashed with exit code ${code}. Restarting...`);
            this.debounceRestart();
          } else {
            Logger.error(`${this.appName} exited gracefully.`);
          }
        });
    
        this.process.on('error', (err) => {
          Logger.error(`Failed to start ${this.appName}:`, err);
        });
    }
    
    public stopApp() {
        if (this.process) {
          Logger.error(`Stopping ${this.appName}...`);
          this.process.kill();
          this.process = null;
          fs.unlinkSync(this.pidFile);
        }
        this.stopWatchingFiles();
    }
    
    public restartApp(isDevMode: boolean) {
        this.isDevMode = isDevMode;
        if (fs.existsSync(this.pidFile)) {
          const pid = parseInt(fs.readFileSync(this.pidFile, 'utf-8'), 10);
          try {
            process.kill(pid);
            Logger.error(`Killed existing process with PID ${pid}`);
          } catch (err) {
            Logger.error(`Failed to kill process with PID ${pid}:`, err);
          }
          fs.unlinkSync(this.pidFile);
        }
        this.startApp();
    }
    
    private watchFiles() {
        if (this.watcher) {
          return; // Already watching files
        }
    
        this.watcher = chokidar.watch(path.dirname(this.script), {
          ignored: /node_modules/,
          persistent: true,
        });
    
        this.watcher.on('change', (filePath) => {
          Logger.error(`File changed: ${filePath}. Restarting ${this.appName}...`);
          this.debounceRestart();
        });
    
        this.watcher.on('error', (error) => {
          Logger.error(`Watcher error: ${error}`);
        });
    }
    
    private stopWatchingFiles() {
        if (this.watcher) {
          this.watcher.close();
          this.watcher = null;
        }
    }
    
    private debounceRestart() {
        if (this.restartTimeout) {
          clearTimeout(this.restartTimeout);
        }
        this.restartTimeout = setTimeout(() => {
          this.restartApp(this.isDevMode);
        }, 1000); // Adjust the delay as needed
    }

}

export default ProcessManager;