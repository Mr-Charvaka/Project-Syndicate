const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let currentWorkspace = null; // Start with no workspace for safety
let currentTerminalDir = null;
let win;
let boltUiProcess;
let boltGatewayProcess;
let opencodeProcess;
let opencodeBackendProcess;
let syndicateState = {
  currentGoal: "Establish the Serene Logic Syndicate",
  status: "idle",
  lastUpdate: Date.now(),
  activeMission: null
};

let agentConfigs = {
  'CEO': 'qwen2.5-coder:7b',
  'CTO': 'qwen2.5-coder:7b',
  'CFO': 'qwen2.5-coder:7b',
  'COO': 'qwen2.5-coder:7b'
};

function startBolt() {
  const boltDir = path.join(__dirname, 'openclaw');
  if (!fs.existsSync(boltDir)) {
    console.error('OpenClaw directory not found at:', boltDir);
    return;
  }
  
  const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const clawHome = path.join(__dirname, '.claw');
  
  // Clean up existing processes on these ports (Windows only)
  if (process.platform === 'win32') {
    try {
      console.log('Cleaning up existing OpenClaw processes...');
      const { execSync } = require('child_process');
      // Kill processes listening on 5173 and 18789
      execSync('for /f "tokens=5" %a in (\'netstat -ano ^| findstr :5173\') do taskkill /f /pid %a', { stdio: 'ignore' });
      execSync('for /f "tokens=5" %a in (\'netstat -ano ^| findstr :18789\') do taskkill /f /pid %a', { stdio: 'ignore' });
    } catch (e) {}

    // Clear stale build locks
    const lockPath = path.join(boltDir, '.artifacts', 'run-node-build.lock');
    if (fs.existsSync(lockPath)) {
      console.log('Clearing stale build lock...');
      try { fs.rmSync(lockPath, { recursive: true, force: true }); } catch (e) {}
    }
  }
  
  // Start Gateway
  console.log('Starting OpenClaw Gateway...');
  // Bypass pnpm script to avoid Windows env var issues
  boltGatewayProcess = spawn('node', ['scripts/run-node.mjs', '--dev', 'gateway'], { 
    cwd: boltDir,
    shell: true,
    env: { 
      ...process.env, 
      OPENCLAW_PORT: '18789', 
      OPENCLAW_HOME: clawHome,
      OPENCLAW_SKIP_CHANNELS: '1' 
    }
  });

  boltGatewayProcess.stdout.on('data', (data) => console.log(`[Claw-Gateway] ${data}`));
  boltGatewayProcess.stderr.on('data', (data) => console.error(`[Claw-Gateway-Error] ${data}`));

  // Start UI (Vite)
  console.log('Starting OpenClaw UI...');
  boltUiProcess = spawn(command, ['run', 'ui:dev'], { 
    cwd: boltDir,
    shell: true,
    env: { ...process.env, OPENCLAW_HOME: clawHome }
  });

  boltUiProcess.stdout.on('data', (data) => console.log(`[Claw-UI] ${data}`));
  boltUiProcess.stderr.on('data', (data) => console.error(`[Claw-UI-Error] ${data}`));

  boltGatewayProcess.on('error', (err) => console.error('Failed to start Gateway:', err));
  boltUiProcess.on('error', (err) => console.error('Failed to start UI:', err));
}



function startOpenCode() {
  const opencodeDir = path.join(__dirname, 'opencode');
  if (!fs.existsSync(opencodeDir)) {
    console.error('OpenCode directory not found at:', opencodeDir);
    return;
  }
  
  // Use bun if available
  const bunPath = path.join(process.env.USERPROFILE, '.bun', 'bin', 'bun.exe');
  const command = fs.existsSync(bunPath) ? bunPath : 'bun';
  
  // Start Backend (CLI/Agent server)
  console.log('Starting OpenCode Backend...');
  opencodeBackendProcess = spawn(command, ['run', 'dev', 'serve', '--port', '4096'], { 
    cwd: opencodeDir,
    shell: true,
    env: { ...process.env }
  });

  opencodeBackendProcess.stdout.on('data', (data) => {
    console.log(`[OpenCode-Backend] ${data.toString().trim()}`);
  });

  opencodeBackendProcess.stderr.on('data', (data) => {
    console.error(`[OpenCode-Backend-Error] ${data.toString().trim()}`);
  });

  // Start Web UI
  console.log('Starting OpenCode Web UI...');
  opencodeProcess = spawn(command, ['run', 'dev:web'], { 
    cwd: opencodeDir,
    shell: true,
    env: { ...process.env }
  });

  opencodeProcess.stdout.on('data', (data) => console.log(`[OpenCode-UI] ${data}`));
  opencodeProcess.stderr.on('data', (data) => console.error(`[OpenCode-UI-Error] ${data}`));
  
  opencodeProcess.on('error', (err) => console.error('Failed to start OpenCode UI:', err));
  opencodeBackendProcess.on('error', (err) => console.error('Failed to start OpenCode Backend:', err));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#1b1c1a',
      height: 40
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      nodeIntegrationInSubFrames: true, // Allow iframe to use IPC
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.loadFile('index.html');
}

// Recursive function to get file tree
function getFileTree(dir, relativePath = "") {
  try {
    const files = fs.readdirSync(dir);
    let tree = [];

    files.forEach(file => {
      if (file === "node_modules" || file === ".git" || file === ".gemini") return;
      
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const rel = path.join(relativePath, file);

      if (stats.isDirectory()) {
        tree.push({
          name: file,
          type: "directory",
          path: rel,
          children: getFileTree(filePath, rel)
        });
      } else {
        tree.push({
          name: file,
          type: "file",
          path: rel
        });
      }
    });

    return tree.sort((a, b) => (b.type === "directory") - (a.type === "directory") || a.name.localeCompare(b.name));
  } catch (err) {
    console.error("Error scanning tree:", err);
    return [];
  }
}

function terminateProcesses() {
  console.log('Terminating all background processes...');
  
  const processes = [
    { name: 'OpenClaw Gateway', proc: boltGatewayProcess },
    { name: 'OpenClaw UI', proc: boltUiProcess },
    { name: 'OpenCode UI', proc: opencodeProcess },
    { name: 'OpenCode Backend', proc: opencodeBackendProcess }
  ];

  processes.forEach(({ name, proc }) => {
    if (proc) {
      console.log(`Killing ${name}...`);
      if (process.platform === 'win32') {
        spawn('taskkill', ['/F', '/T', '/PID', proc.pid.toString()], { shell: true });
      } else {
        proc.kill();
      }
    }
  });
}

app.whenReady().then(() => {
  startOpenCode();
  createWindow();
});

app.on('window-all-closed', () => {
  terminateProcesses();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('exit', terminateProcesses);
process.on('SIGINT', terminateProcesses);

// IPC handlers
ipcMain.handle('select-workspace', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    currentWorkspace = result.filePaths[0];
    currentTerminalDir = currentWorkspace;
    console.log("Syndicate Workspace Locked to:", currentWorkspace);
    return currentWorkspace;
  }
  return null;
});

// Helper to validate path is within sandbox
function isPathSafe(targetPath) {
  if (!currentWorkspace) return false;
  const absolutePath = path.isAbsolute(targetPath) ? targetPath : path.join(currentWorkspace, targetPath);
  const resolvedPath = path.resolve(absolutePath);
  return resolvedPath.startsWith(currentWorkspace);
}

ipcMain.handle('open-workspace', async () => {
  console.log("Main process: opening folder dialog...");
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });

  if (!result.canceled) {
    currentWorkspace = result.filePaths[0];
    currentTerminalDir = currentWorkspace; // Sync terminal directory
    console.log("Main process: workspace selected ->", currentWorkspace);
    return { path: currentWorkspace, tree: getFileTree(currentWorkspace) };
  }
  console.log("Main process: workspace selection cancelled.");
  return null;
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    return {
      name: path.basename(filePath),
      path: filePath
    };
  }
  return null;
});

ipcMain.handle('get-file-tree', async () => {
  return getFileTree(currentWorkspace);
});


ipcMain.handle('read-file', async (event, relPath) => {
  try {
    const fullPath = path.join(currentWorkspace, relPath);
    if (!fs.existsSync(fullPath)) return `ERROR: File "${relPath}" does not exist.`;
    return fs.readFileSync(fullPath, 'utf8');
  } catch (err) {
    return `ERROR: Could not read file "${relPath}": ${err.message}`;
  }
});

ipcMain.handle('write-file', async (event, relPath, content) => {
  const fullPath = path.join(currentWorkspace, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  return true;
});

ipcMain.handle('create-file', async (event, filename, parentPath = "") => {
  const fullPath = path.join(currentWorkspace, parentPath, filename);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '', 'utf8');
    return true;
  }
  return false;
});

ipcMain.handle('create-folder', async (event, foldername, parentPath = "") => {
  const fullPath = path.join(currentWorkspace, parentPath, foldername);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    return true;
  }
  return false;
});

ipcMain.handle('rename-item', async (event, oldPath, newName) => {
  try {
    const fullOldPath = path.join(currentWorkspace, oldPath);
    const dir = path.dirname(fullOldPath);
    const fullNewPath = path.join(dir, newName);
    
    console.log(`Renaming: ${fullOldPath} -> ${fullNewPath}`);
    
    if (fs.existsSync(fullOldPath)) {
      fs.renameSync(fullOldPath, fullNewPath);
      console.log("Rename successful");
      return true;
    } else {
      console.error("Rename failed: Source path does not exist", fullOldPath);
      return false;
    }
  } catch (err) {
    console.error("Rename error:", err);
    return false;
  }
});

ipcMain.handle('delete-item', async (event, relPath) => {
  const fullPath = path.join(currentWorkspace, relPath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
    return true;
  }
  return false;
});

ipcMain.on('run-command', (event, command) => {
  const trimmedCmd = command.trim();
  if (trimmedCmd.startsWith('cd ')) {
    const target = trimmedCmd.substring(3).trim().replace(/['"]/g, '');
    const newPath = path.isAbsolute(target) ? target : path.resolve(currentTerminalDir || currentWorkspace, target);
    
    if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
      currentTerminalDir = newPath;
      event.reply('terminal-path-update', currentTerminalDir);
      event.reply('terminal-output', `<div class="text-zinc-500 italic">Directory changed to: ${currentTerminalDir}</div>\n`);
      return;
    } else {
      event.reply('terminal-output', `<span class="text-red-400">Error: Directory not found: ${target}</span>\n`);
      return;
    }
  }

  const shell = spawn('powershell.exe', ['-Command', command], { cwd: currentTerminalDir || currentWorkspace });

  shell.stdout.on('data', (data) => {
    event.reply('terminal-output', data.toString());
  });

  shell.stderr.on('data', (data) => {
    event.reply('terminal-output', `<span class="text-red-500">${data.toString()}</span>`);
  });

  shell.on('exit', (code) => {
    event.reply('terminal-output', `\n<div class="text-zinc-500 font-bold border-t border-zinc-800 pt-1 mt-1">Process exited with code ${code}</div>\n`);
  });
});
ipcMain.on('run-external', (event, command) => {
  const psCommand = `start powershell -NoExit -Command "${command.replace(/"/g, '""')}"`;
  spawn('cmd.exe', ['/c', psCommand], { shell: true, cwd: currentTerminalDir || currentWorkspace });
});

// Claw Code Integration
let clawSessions = new Map();

function getAnthropicKey() {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  try {
    const keysPath = path.join(__dirname, 'keys.txt');
    if (fs.existsSync(keysPath)) {
      const content = fs.readFileSync(keysPath, 'utf8');
      const matches = content.match(/sk-or-v1-[a-f0-9]+/gi);
      if (matches && matches.length > 1) {
        return matches[1]; // Return the second key
      } else if (matches && matches.length > 0) {
        return matches[0];
      }
    }
  } catch (e) {
    console.error('Error reading key from keys.txt:', e);
  }
  return '';
}

ipcMain.on('claw-session-start', (event, sessionId) => {
  console.log(`Starting Claw session: ${sessionId}`);
  const clawPath = path.join(__dirname, 'claw-code', 'rust', 'target', 'release', 'claw.exe');
  
  if (!fs.existsSync(clawPath)) {
    event.reply(`claw-output-${sessionId}`, `ERROR: Claw binary not found at ${clawPath}\n`);
    return;
  }

  const anthropicKey = getAnthropicKey();

  // Use 'repl' mode for interactive persistent sessions
  const clawProcess = spawn(clawPath, ['repl', '--model', 'openai/gpt-oss-120b:free'], {
    cwd: currentWorkspace,
    env: { 
      ...process.env, 
      ANTHROPIC_API_KEY: anthropicKey,
      ANTHROPIC_BASE_URL: 'https://openrouter.ai/api/v1'
    },
    shell: true
  });

  clawSessions.set(sessionId, clawProcess);

  clawProcess.stdout.on('data', (data) => {
    // Strip HTML tags for clean terminal output
    const cleanData = data.toString().replace(/<[^>]*>/g, '');
    event.reply(`claw-output-${sessionId}`, cleanData);
  });

  clawProcess.stderr.on('data', (data) => {
    const cleanData = data.toString().replace(/<[^>]*>/g, '');
    event.reply(`claw-output-${sessionId}`, cleanData);
  });

  clawProcess.on('exit', (code) => {
    event.reply(`claw-output-${sessionId}`, `\n[Claw exited with code ${code}]\n`);
    clawSessions.delete(sessionId);
  });
});

ipcMain.on('claw-input', (event, sessionId, input) => {
  const clawProcess = clawSessions.get(sessionId);
  if (clawProcess) {
    clawProcess.stdin.write(input);
  }
});

ipcMain.handle('git-status', async () => {
  return new Promise((resolve) => {
    const git = spawn('git', ['status', '--porcelain'], { cwd: currentWorkspace });
    let output = '';
    git.stdout.on('data', (data) => output += data.toString());
    git.on('close', () => resolve(output));
  });
});

ipcMain.handle('git-commit', async (event, message) => {
  return new Promise((resolve) => {
    const add = spawn('git', ['add', '.'], { cwd: currentWorkspace });
    add.on('close', () => {
      const commit = spawn('git', ['commit', '-m', message], { cwd: currentWorkspace });
      commit.on('close', (code) => resolve(code === 0));
    });
  });
});

ipcMain.handle('git-log', async () => {
  return new Promise((resolve) => {
    const log = spawn('git', ['log', '--oneline', '-n', '15'], { cwd: currentWorkspace });
    let output = '';
    log.stdout.on('data', (data) => output += data.toString());
    log.on('close', () => resolve(output));
  });
});

ipcMain.handle('git-init', async () => {
  return new Promise((resolve) => {
    const init = spawn('git', ['init'], { cwd: currentWorkspace });
    init.on('close', (code) => resolve(code === 0));
  });
});

ipcMain.handle('get-workspace-path', async () => {
  return currentTerminalDir || currentWorkspace;
});

ipcMain.handle('ai-chat', async (event, messages, role) => {
  const model = agentConfigs[role] || 'qwen2.5-coder:7b';
  const config = {
    model: model,
    endpoint: 'http://localhost:11434/v1/chat/completions'
  };

  const systemPrompts = {
    'CEO': `You are the CEO of the Serene Logic Syndicate. You report directly to the PRESIDENT (The User).
    The PRESIDENT's word is ABSOLUTE. If the PRESIDENT intervenes in the discussion, you must immediately pivot your strategy to follow their lead.
    PRIME DIRECTIVES:
    1. SYSTEMATIC DEBUGGING: If a build fails, STOP. Reproduce and fix root cause.
    2. VERTICAL SLICING: Build features end-to-end in small increments.
    3. PLAN-FIRST: Read files and map dependencies BEFORE writing code.
    4. PRESIDENTIAL COMMAND: Your primary goal is to fulfill the vision of the PRESIDENT.
    
    SKILLS LIBRARY: You have access to 21 specialized skills in /SYNDICATE_SKILLS. 
    Check KNOWLEDGE_INDEX.md and READ the relevant skill file before starting complex work.
    
    Start EVERY response with a <thought> block. All actions in JSON blocks.
    You lead the mission in Serene Logic IDE.`,

    'CTO': `You are the Chief Technology Officer. You follow the Syndicate Prime Directives.
    TECHNICAL MANDATE:
    - PROTOCOLS: Systematic Debugging, Plan-First, Vertical Slicing.
    - ENVIRONMENT: Windows / PowerShell / MinGW.
    - REASONING: Use <thought> for architectural planning. All mutations in JSON.`,

    'SDE': `You are the Lead Software Development Engineer. You follow the Prime Directives.
    DEVELOPMENT PROTOCOL:
    - PRIME DIRECTIVE: Follow Systematic Debugging and Incremental Implementation.
    - ENVIRONMENT: LEGACY POWERSHELL. USE ';' ALWAYS. NO '&&'.
    - ERROR TRIGGER: If a command fails, enter 'Repair Mode'. Analyze, fix, and verify.`,
    
    'CFO': `You are the Chief Financial Officer. Use <thought> and JSON actions to manage resources.`,
    'COO': `You are the Chief Operating Officer. Orchestrate missions via the Antigravity JSON Protocol.`,
    'SEC': `You are the Security Analyst. Use JSON actions to execute scans and patch vulnerabilities.`
  };

  // Get Workspace Manifest (Optimized)
  let manifest = "No Workspace Selected (Agents Restricted)";
  try {
    if (currentWorkspace) {
      const files = fs.readdirSync(currentWorkspace, { recursive: false });
      manifest = files.filter(f => !f.startsWith('.') && f !== 'node_modules').join(', ');
    }
  } catch (e) {
    console.error("Manifest error:", e);
  }


  const basePrompt = systemPrompts[role] || systemPrompts['CEO'];
  const systemMessage = { 
    role: 'system', 
    content: `${basePrompt}\n\nCURRENT WORKSPACE MANIFEST (Files in project):\n${manifest}` 
  };
  
  // Inject system prompt at the beginning
  const finalMessages = [systemMessage, ...messages];

  console.log(`[Syndicate] ${role} is thinking using ${config.model}...`);

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.model,
        messages: finalMessages
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return `Error: ${errorData.error?.message || response.statusText}`;
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      return "Error: AI model returned an empty or malformed response.";
    }
  } catch (err) {
    console.error("AI Bridge Error:", err);
    return `System Error: ${err.message}`;
  }
});

// Syndicate Core Orchestrator
ipcMain.handle('get-syndicate-state', () => syndicateState);

ipcMain.handle('update-syndicate-goal', (event, goal) => {
  syndicateState.currentGoal = goal;
  syndicateState.status = 'planning';
  syndicateState.lastUpdate = Date.now();
  console.log('Syndicate Goal Updated:', goal);
  return syndicateState;
});

ipcMain.handle('execute-mission', (event, mission) => {
  syndicateState.activeMission = mission;
  syndicateState.status = 'implementing';
  syndicateState.lastUpdate = Date.now();
  console.log('Mission Dispatched to SDE:', mission);
  
  // Tell index.html to switch views
  if (win) {
    win.webContents.send('switch-view', 'code');
  }
  return syndicateState;
});

// Auto-injection for Opencode
ipcMain.on('opencode-ready-for-mission', (event) => {
  if (syndicateState.activeMission) {
    console.log('Injecting mission into Opencode...');
    event.reply('inject-mission', syndicateState.activeMission);
    syndicateState.activeMission = null; // Clear after injection
  }
});

// Agent Configuration IPCs
ipcMain.handle('get-agent-configs', () => agentConfigs);

ipcMain.handle('update-agent-model', (event, agentId, model) => {
  agentConfigs[agentId] = model;
  console.log('Agent Model Updated:', agentId, '->', model);
  return { success: true };
});

ipcMain.handle('get-ollama-models', async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) return [];
    const data = await response.json();
    return data.models.map(m => m.name);
  } catch (e) {
    console.error('Failed to fetch Ollama models:', e);
    return ['qwen2.5-coder:7b']; // Fallback
  }
});

// Syndicate Direct Action Execution
ipcMain.handle('execute-syndicate-action', async (event, action) => {
  if (!currentWorkspace) return { error: "No workspace selected. Please select a project directory first." };
  
  console.log('[Syndicate Action Execution]', action);
  switch (action.action) {
    case 'run':
      if (action.command) {
        // Run is always executed within currentWorkspace (CWD)
        const child = spawn(action.command, { shell: true, cwd: currentWorkspace });
        child.stdout.on('data', (data) => console.log('[Syndicate-Term] ' + data));
        child.stderr.on('data', (data) => console.error('[Syndicate-Term-Err] ' + data));
      }
      break;
    case 'write':
      if (action.path && action.content) {
        if (!isPathSafe(action.path)) return { error: "Security Access Denied: Path outside of workspace." };
        const fullPath = path.isAbsolute(action.path) ? action.path : path.join(currentWorkspace, action.path);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, action.content);
        console.log('[Syndicate-FS] Written:', fullPath);
      }
      break;
    case 'read':
      if (action.path) {
        if (!isPathSafe(action.path)) return { error: "Security Access Denied: Path outside of workspace." };
        const fullPath = path.isAbsolute(action.path) ? action.path : path.join(currentWorkspace, action.path);
        if (fs.existsSync(fullPath)) {
          return fs.readFileSync(fullPath, 'utf8');
        }
      }
      break;
  }
  return { success: true };
});
