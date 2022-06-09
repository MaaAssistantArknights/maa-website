import * as fs from "fs";

const maaWebDistPath = "./apps/web/dist";
const maaDocDistPath = "./apps/doc/build";

const bundleBasePath = "./dist";
const bundleDocPath = "./dist/doc";

if (fs.existsSync(maaWebDistPath) === false) {
  process.exit(-1);
}

if (fs.existsSync(bundleBasePath)) {
  fs.rmdirSync(bundleBasePath, { recursive: true });
}

fs.mkdirSync(bundleBasePath);

fs.cpSync(maaWebDistPath, bundleBasePath, { recursive: true });
fs.cpSync(maaDocDistPath, bundleDocPath, { recursive: true });
