import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const siteDir = path.join(root, 'site');
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

function getGitValue(args, fallback = '') {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

const sha = process.env.GITHUB_SHA || getGitValue(['rev-parse', 'HEAD'], 'local');
const metadata = {
  docVersion: packageJson.version,
  buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  refName: process.env.GITHUB_REF_NAME || getGitValue(['branch', '--show-current'], 'local'),
  sha,
  shortSha: sha === 'local' ? 'local' : sha.slice(0, 7),
};

mkdirSync(siteDir, { recursive: true });
writeFileSync(path.join(siteDir, 'version.json'), JSON.stringify(metadata, null, 2) + '\n');
