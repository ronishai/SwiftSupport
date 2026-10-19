import { build } from 'esbuild';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const config = require('../apps/api/esbuild.config.cjs');
const apiRoot = path.resolve(__dirname, '..', 'apps', 'api');
process.chdir(apiRoot);

// This wrapper ensures esbuild options are explicitly passed through NX and CI.
(async () => {
  try {
    await build(config);
    console.log('esbuild wrapper: build succeeded');
    process.exit(0);
  } catch (e) {
    console.error('esbuild wrapper: build failed', e);
    process.exit(1);
  }
})();
