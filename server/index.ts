#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting Python Flask backend...');


const flaskProcess = spawn('python', ['app_refactored.py'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, PYTHONUNBUFFERED: '1' }
});

flaskProcess.on('error', (error) => {
  console.error('Failed to start Flask:', error);
  process.exit(1);
});

flaskProcess.on('close', (code) => {
  console.log(`Flask process exited with code ${code}`);
  process.exit(code);
});


process.on('SIGINT', () => {
  console.log('\nShutting down Flask backend...');
  flaskProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nTerminating Flask backend...');
  flaskProcess.kill('SIGTERM');
});