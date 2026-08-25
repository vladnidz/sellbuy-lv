// docker-entrypoint.js
// Runs Prisma migrations (and optionally the seed) before handing off to the Next server.
// Controlled by env flags so production restarts stay fast:
//   RUN_MIGRATIONS=true  -> `npx prisma migrate deploy`
//   RUN_SEED=true        -> `npx prisma db seed` (runs only after migrations succeed)
// The remaining CMD (node server.js) is spawned as a direct child whose stdio is
// inherited; SIGTERM/SIGINT received by this process are forwarded to it so
// container stops shut down the Next server gracefully.

const { spawnSync, spawn } = require('child_process');

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

// Spawn the CMD (node server.js) as a child; forward termination signals to it
// so `docker stop` / orchestrator shutdowns reach the Next server.
const cmd = process.argv.slice(2);
if (cmd.length === 0) {
  console.error('[entrypoint] no server command found; expecting CMD "node server.js"');
  process.exit(1);
}
console.log('[entrypoint] starting:', cmd.join(' '));
const child = spawn(cmd[0], cmd.slice(1), { stdio: 'inherit', env: process.env });

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    if (!child.killed && child.exitCode === null) {
      console.log(`[entrypoint] forwarding ${sig} to server`);
      child.kill(sig);
    }
  });
}

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
