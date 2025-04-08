const path = require("path");
const { readJson, writeFile } = require("./index.cjs");
const prettier = require("prettier");
const LOGGER = require("./logger.cjs");
const { viteConfigTemplate } = require("../templates/vite/index.cjs");

const PACKAGEJSON = path.resolve(__dirname, "../../package.json");

async function updatePackageJson(content, field) {
  const packageJsonContent = readJson(PACKAGEJSON);

  let newPackageJsonContent = {
    ...packageJsonContent,
  };

  if (packageJsonContent.hasOwnProperty(field)) {
    newPackageJsonContent[field] = {
      ...newPackageJsonContent[field],
      ...content,
    };
  } else {
    newPackageJsonContent[field] = content;
  }

  const stringified = JSON.stringify(newPackageJsonContent);
  const prettiefied = await prettier.format(stringified, { parser: "json" });

  writeFile(PACKAGEJSON, prettiefied);

  LOGGER.box("Package.json update");
}

module.exports.updatePackageJson = updatePackageJson;

function readPackageJson(){

  return readJson(PACKAGEJSON)

}

module.exports.readPackageJson = readPackageJson;

const VITEJS = path.resolve(__dirname, "../../vite.config.js");
const VITECONFIGS = require("../../vite.config")

async function updateVitePaths(newPaths) {
  const PATHS_FILE_PATH = path.resolve(
    __dirname,
    "../templates/vite/paths.json"
  );
  const defaultsPaths = readJson(PATHS_FILE_PATH);
  let newAbsolutPaths = {
    ...defaultsPaths,
  };

  if (newPaths && newPaths.length > 0) {
    newPaths.forEach(function (pathInfo) {
      newAbsolutPaths[pathInfo.alias] = pathInfo.path;
    });
  }

  const newPathsContent = JSON.stringify(newAbsolutPaths);
  const prettiefiedPathsContent = await prettier.format(newPathsContent, {
    parser: "json",
  });

  writeFile(PATHS_FILE_PATH, prettiefiedPathsContent);

  const newContent = viteConfigTemplate();

  const prettiefied = await prettier.format(newContent, {
    parser: "typescript",
  });

  writeFile(VITEJS, prettiefied);
}
module.exports.updateVitePaths = updateVitePaths;

function readVitePaths(){

  return VITECONFIGS.default.resolve.alias

}

module.exports.readVitePaths = readVitePaths;

