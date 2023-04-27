import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filename = path.basename(__filename);
const maaDocDir = path.dirname(url.fileURLToPath(
    await import.meta.resolve('MaaAssistantArknights/docs/readme.md')
));

const syncIgnore = [
    filename,
    'package.json',
    'tsconfig.json',
    '.gitignore',
];

fs.readdirSync(__dirname).forEach(f => {
    if (syncIgnore.includes(f)) return;
    console.log(`removing ${f}`);
    fs.rmSync(path.join(__dirname, f), { recursive: true })
});

fs.readdirSync(maaDocDir).forEach(f => {
    console.log(`copying ${f}`);
    fs.cpSync(path.join(maaDocDir, f), path.join(__dirname, f),
        { recursive: true, errorOnExist: true }
    );
});
