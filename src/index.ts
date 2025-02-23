import { exec } from 'child_process';
import path from 'path';
import ProcessManager from './pm';
import "reflect-metadata"

const appName = 'zapp';
const script = path.join(__dirname, '../dist/zapp.js');
const isDevMode = process.env.NODE_ENV !== 'production';

exec(`fuser -k 3001/tcp`, (err, stdout, stderr) => {})

const processManager = new ProcessManager(appName, script, isDevMode);
processManager.startApp();