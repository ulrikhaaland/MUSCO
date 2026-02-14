const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function run(scriptName) {
  const scriptPath = path.join(projectRoot, 'scripts', scriptName);
  const res = spawnSync(process.execPath, [scriptPath], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
}

run('generate-body-part-artifacts.js');
