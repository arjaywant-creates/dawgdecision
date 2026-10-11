// DawgDecision Start Script

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const children = [];
const isWin = process.platform === 'win32';

let isShuttingDown = false;
function cleanup() {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log('\nGracefully shutting down all services... (this takes a few seconds)');
    for (const child of children) {
        try {
            if (!isWin) {
                process.kill(-child.pid);
            } else if (child.pid) {
                spawn('taskkill', ['/pid', child.pid.toString(), '/T', '/F'], { stdio: 'ignore' });
            }
        } catch (e) {}
    }
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function spawnProcess(command, args, customEnv = {}) {
    const commandStr = `${command} ${args.join(' ')}`;
    const child = spawn(commandStr, { 
        stdio: 'inherit',
        shell: true,
        detached: !isWin,
        env: { ...process.env, ...customEnv }
    });
    
    child.on('error', () => {});
    child.on('close', () => {
        const index = children.indexOf(child);
        if (index !== -1) children.splice(index, 1);
    });

    children.push(child);
    return child;
}

function runCommand(command, args, customEnv = {}) {
    return new Promise((resolve) => {
        const child = spawnProcess(command, args, customEnv);
        child.on('close', () => resolve());
        child.on('error', () => resolve());
    });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log("Starting DawgDecision services...\n");

    // 1. Environment Setup
    const envPath = path.join('frontend', '.env');
    const envExamplePath = path.join('frontend', '.env.example');
    
    if (!fs.existsSync(envPath)) {
        console.log("[Init] frontend/.env not found. Copying from frontend/.env.example...");
        if (fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
            console.log("[Init] .env copied successfully.\n");
        }
    }

    try {
        // 2. Start Database
        console.log("[1/3] Starting Database...");
        spawnProcess('npm', ['run', 'db'], { CI: 'true' });

        // Give the database a few seconds to initialize
        console.log("Waiting 2s for database to initialize...");
        await sleep(2000);

        // 3. Sync Database Schema
        console.log("\n[Init] Syncing database schema...");
        await runCommand('npm', ['run', 'db:push'], { CI: 'true' });

        // 4. Start Backend
        console.log("\n[2/3] Starting Backend...");
        const backendCmd = isWin ? 'backend:win' : 'backend';
        spawnProcess('npm', ['run', backendCmd]);

        // 5. Start Frontend
        console.log("\n[3/3] Starting Frontend...");
        spawnProcess('npm', ['run', 'dev']);

        console.log("\nAll services started! Press Ctrl+C to stop all.");

    } catch (error) {
        console.error(`\nError: ${error.message}`);
        cleanup();
    }
}

main();
