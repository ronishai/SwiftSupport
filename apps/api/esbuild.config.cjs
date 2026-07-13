const esbuildPluginTsc = require('esbuild-plugin-tsc');
const path = require('path')

module.exports = {
  entryPoints: [path.join(__dirname, 'src/main.ts')],
  bundle: true,
  minify: false,
  // use a valid esbuild target for Node
  target: ['node18'],
  platform: 'node',
  // avoid bundling optional Nest packages that may be required at runtime
  external: [
    '@nestjs/websockets/socket-module',
    '@nestjs/microservices/microservices-module',
    '@nestjs/microservices',
  ],
  outfile: path.join(__dirname, 'dist/main.js'),
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: path.join(__dirname, 'tsconfig.app.json'), // Points to your lib/app tsconfig
    }),
  ],
};
