import * as fs from "fs";

const maaWebDistPath = "./apps/web/dist";

const bundlePath = "./dist";

if (fs.existsSync(maaWebDistPath) === false) {
  process.exit(-1);
}

if (fs.existsSync(bundlePath)) {
  fs.rmdirSync(bundlePath, { recursive: true });
}

fs.mkdirSync(bundlePath);

fs.cpSync(maaWebDistPath, bundlePath, { recursive: true });
