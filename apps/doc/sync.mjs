import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const maaDocDir = path.dirname(path.dirname(url.fileURLToPath(
    await import.meta.resolve('MaaAssistantArknights/docs/.vuepress/config.ts')
)));

console.log(`maaDocDir: ${maaDocDir}`);

console.log(`removing docs`);
fs.rmSync(path.join(__dirname, 'docs'), { recursive: true, force: true })

console.log(`copying docs`);
fs.cpSync(maaDocDir, path.join(__dirname, 'docs'), { recursive: true });
