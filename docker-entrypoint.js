// docker-entrypoint.js
// Runs Prisma migrations (and optionally the seed) before handing off to the Next server.
// Controlled by env flags so production restarts stay fast:
//   RUN_MIGRATIONS=true  -> `npx prisma migrate deploy`
//   RUN_SEED=true        -> `npx prisma db seed` (runs only after migrations succeed)
// The remaining CMD (node server.js) is exec'd via child_process so signals propagate.

const { spawnSync } = require('child_process');

function run(cmd, args) {
  console.log(`[entrypoint] ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', env: process.env });
  if (res.status !== 0) {
    console.error(`[entrypoint] ${cmd} exited with code ${res.status}`);
    process.exit(res.status ?? 1);
  }
}

const runMigrations = process.env.RUN_MIGRATIONS !== 'false';
const runSeed = process.env.RUN_SEED === 'true';

if (runMigrations) {
  run('npx', ['prisma', 'migrate', 'deploy']);
}

if (runSeed) {
  run('npx', ['prisma', 'db', 'seed']);
}

// Exec the CMD (node server.js) in place so PID 1 / signals are handled by node.
const { exec } = require('child_process');
const cmd = process.argv.slice(2);
if (cmd.length === 0) {
  console.error('[entrypoint] no server command found; expecting CMD "node server.js"');
  process.exit(1);
}
console.log('[entrypoint] starting:', cmd.join(' '));
const child = spawnSync(cmd[0], cmd.slice(1), { stdio: 'inherit', env: process.env, detached: false });
process.exit(child.status ?? 0);
