import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRESET_LANGUAGE = 'us';
const PRESET_FOOTER = {
  labelStyle: 'unicode',
  contextFormat: 'tokens',
  items: [
    'model-name',
    'agent-state',
    'mode',
    'quota',
    'quota-weekly',
    'quota-argon',
    'quota-claude',
    'quota-claude-weekly',
    'context-used',
  ],
};

function buildStatusLineCommand(hookScriptPath) {
  if (process.platform === 'win32') {
    // Windows Go exec.Command("cmd", "/c", command) breaks with double quotes.
    if (hookScriptPath.includes(' ')) {
      return `node --import ${pathToFileURL(hookScriptPath).href} -e 0`;
    }
    return `node ${hookScriptPath}`;
  }
  const quoteIfNeeded = (p) => (p.includes(' ') ? `"${p}"` : p);
  return `${quoteIfNeeded(process.execPath)} ${quoteIfNeeded(hookScriptPath)}`;
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  if (!raw.trim()) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Invalid JSON object in ${filePath}`);
  }
  return parsed;
}

function writeJsonNoBOM(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', { encoding: 'utf8' });
}

function updateSettings(settingsPath, statusLineCommand) {
  const settings = readJsonSafe(settingsPath);
  settings.ui = settings.ui && typeof settings.ui === 'object' ? settings.ui : {};
  settings.ui.language = PRESET_LANGUAGE;

  const existingFooter =
    settings.ui.footer && typeof settings.ui.footer === 'object' ? settings.ui.footer : {};
  const nextFooter = {
    ...existingFooter,
    ...PRESET_FOOTER,
  };
  delete nextFooter.itemStyles;
  delete nextFooter.theme;
  delete nextFooter.style;
  settings.ui.footer = nextFooter;

  const existingStatusLine =
    settings.statusLine && typeof settings.statusLine === 'object' && !Array.isArray(settings.statusLine)
      ? settings.statusLine
      : {};
  settings.statusLine = {
    ...existingStatusLine,
    enabled: true,
    type: 'command',
    command: statusLineCommand,
  };

  writeJsonNoBOM(settingsPath, settings);
}

function main() {
  const homeDir = os.homedir();
  const hooksDir = path.join(homeDir, '.gemini', 'antigravity-cli', 'hooks');
  fs.mkdirSync(hooksDir, { recursive: true });

  for (const file of ['statusline-quota.mjs', 'fetch-local-quota.mjs']) {
    const src = path.join(__dirname, file);
    const dst = path.join(hooksDir, file);
    const content = fs.readFileSync(src, 'utf8').replace(/^\uFEFF/, '');
    fs.writeFileSync(dst, content, { encoding: 'utf8' });
  }

  const hookScriptPath = path.join(hooksDir, 'statusline-quota.mjs');
  const statusLineCommand = buildStatusLineCommand(hookScriptPath);

  const targets = [
    path.join(homeDir, '.gemini', 'settings.json'),
    path.join(homeDir, '.gemini', 'antigravity-cli', 'settings.json'),
  ];
  const projectSettingsPath = path.join(process.cwd(), '.gemini', 'settings.json');
  if (fs.existsSync(projectSettingsPath)) {
    targets.push(projectSettingsPath);
  }

  for (const target of targets) {
    updateSettings(target, statusLineCommand);
    console.log(`Updated: ${target}`);
  }

  console.log(`Hooks deployed to: ${hooksDir}`);
  console.log(`Activate immediately in agy with: /statusline ${statusLineCommand}`);
}

main();
