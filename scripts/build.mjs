import { build } from 'esbuild';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
await mkdir('lib', { recursive: true });
await copyFile('src/index.js', 'lib/index.js');
const { name } = JSON.parse(await readFile('package.json', 'utf8'));
const result = await build({ entryPoints: ['src/client.jsx'], bundle: true, write: false,
  format: 'cjs', platform: 'browser', target: 'es2022', jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'], loader: { '.css': 'text' } });
await writeFile('lib/client.js', `window.__ModuleLoader__.load({id:${JSON.stringify(name)},factory:(require)=>{const module={exports:{}};const exports=module.exports;\n${result.outputFiles[0].text}\nreturn module.exports;}});\n`);
console.log('Built Harness host entry + lazy client factory.');
