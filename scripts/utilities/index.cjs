const fs = require("fs");
const path = require("path");
const multiSelect = require("inquirer-select-pro");
const { select, type } = require("@inquirer/prompts");
const { execSync } = require("child_process");
const LOGGER = require("./logger.cjs");

/**
 *
 * @param type
 * @param message
 */
function logger(type, message) {
  switch (type) {
    case "success":
      console.log(`\x1b[42m ${message} \x1b[42m`);
      break;
    case "info":
      console.log(`\x1b[44m ${message} \x1b[44m`);
      break;
    case "warn":
      console.log(`\x1b[43m ${message} \x1b[43m`);
      break;
    case "error":
      console.log(`\x1b[41m ${message} \x1b[41m`);
      break;
    default:
      console.log(message);
      break;
  }
}

const DEFAULT_IGNORE_LIST = [
  ".git/",
  ".gitignore",
  "eslint.config.js",
  "index.html",
  "jsconfig.json",
  "node_modules/",
  "package-lock.json",
  "package.json",
  "public/",
  "README.md",
  "vite.config.js",
];

/**
 * Reads all files and folders in the current directory.
 * @param pathToRead
 * @param ignoreList
 * @returns {object} - An object containing arrays of files and folders.
 */
function readCurrentDirectory(pathToRead = undefined, ignoreList = []) {
  const currentPath = pathToRead
    ? path.resolve(process.cwd(), pathToRead)
    : process.cwd();
  let result = [];
  const list_to_ignore = DEFAULT_IGNORE_LIST.concat(ignoreList);

  try {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isFile()) {
        result.push(item);
      }
    });

    if (list_to_ignore.length > 0) {
      result = result.filter((c) => !list_to_ignore.includes(c));
    }

    return result;
  } catch (error) {
    console.error("Error reading the directory:", error);
  }

  return result;
}

/**
 *
 * @param filesInDir
 */
async function selectInDirectory(filesInDir) {
  if (
    filesInDir === undefined ||
    filesInDir === null ||
    !Array.isArray(filesInDir) ||
    filesInDir.length === 0
  ) {
    throw new Error("There's no files to select");
  }

  try {
    const files_selected = await multiSelect.select({
      message: "Select files:",
      options: filesInDir.map((f) => ({ name: f, value: f })),
    });

    return files_selected;
  } catch (error) {
    console.error("Cannot select files", error);
  }
}

/**
 *
 * @param filePath
 * @param codeToAdd
 * @param lineNumber
 */
function insertLinesAt(filePath, codeToAdd, lineNumber) {
  fs.readFile(filePath, "utf8", (readErr, data) => {
    if (readErr) {
      console.error("Error reading the file:", readErr);
      return;
    }

    const lines = data.split("\n");

    lines.splice(lineNumber - 1, 0, codeToAdd);

    const updatedContent = lines.join("\n");

    fs.writeFile(filePath, updatedContent, "utf8", (writeErr) => {
      if (writeErr) {
        console.error("Error writing to the file:", writeErr);
      } else {
        console.log("Lines inserted successfully!");
      }
    });
  });
}

/**
 * Writes content to a specified file, creating any necessary directories.
 *
 * @param {string} filePath - The relative path to the file where content will be written.
 * @param {string} content - The content to write into the file.
 */
function writeFile(filePath, content) {
  const fileCompletePath = path.resolve(__dirname, filePath);

  const directoryPath = path.dirname(fileCompletePath);

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  fs.writeFileSync(fileCompletePath, content);
}

function readJson(filePath) {
  try {
    return JSON.parse(
      fs.readFileSync(path.resolve(__dirname, filePath), "utf-8")
    );
  } catch (error) {
    LOGGER.error(`${filePath} not exist`);
  }
}

function runCommand(command, options = undefined) {
  let defaultOptions = {
    toConvert: true,
    showLogs: false,
  };

  if (options) {
    defaultOptions = {
      ...defaultOptions,
      ...options,
    };
  }

  const { toConvert, showLogs } = defaultOptions;

  let execOptions = {};

  if (toConvert) {
    execOptions.encoding = "utf-8";
  }
  if (showLogs) {
    execOptions.stdio = "inherit";
  }

  if (toConvert) {
    const result = execSync(command, { ...execOptions, stdio: "pipe" }).trim();
    return JSON.parse(result);
  } else return execSync(command, execOptions);
}

/**
 * Interactive folder selector with free navigation.
 */
// async function navigateAndSelectFolders(startDir = process.cwd()) {
//   const selectedFolders = new Set();
//   let currentDir = path.resolve(startDir);
//   const history = [];

//   while (true) {
//     const items = fs
//       .readdirSync(currentDir, { withFileTypes: true })
//       .filter((dirent) => dirent.isDirectory())
//       .map((dirent) => dirent.name);

//     const choices = [
//       ...items.map((name) => ({
//         name: selectedFolders.has(path.join(currentDir, name))
//           ? `✅ ${name}`
//           : name,
//         value: name,
//       })),
//     ];

//     if (history.length > 0) {
//       choices.unshift({ name: "⬅️  Back", value: "__back__" });
//     }

//     choices.push({ name: "✅ Confirm selection", value: "__confirm__" });

//     const answer = await select({
//       message: `Current directory: ${currentDir}`,
//       choices,
//       loop: false,
//     });

//     if (answer === "__back__") {
//       currentDir = history.pop();
//     } else if (answer === "__confirm__") {
//       return [...selectedFolders];
//     } else {
//       const fullPath = path.join(currentDir, answer);

//       if (selectedFolders.has(fullPath)) {
//         selectedFolders.delete(fullPath);
//       } else {
//         const stats = fs.statSync(fullPath);
//         if (stats.isDirectory()) {
//           // allow selecting OR going into it
//           const subChoices = [
//             { name: "📁 Open folder", value: "__open__" },
//             {
//               name: selectedFolders.has(fullPath)
//                 ? "❌ Deselect this folder"
//                 : "✅ Select this folder",
//               value: "__toggle_select__",
//             },
//             { name: "⬅️  Cancel", value: "__cancel__" },
//           ];

//           const subAnswer = await select({
//             message: `What do you want to do with "${answer}"?`,
//             choices: subChoices,
//             loop: false,
//           });

//           if (subAnswer === "__open__") {
//             history.push(currentDir);
//             currentDir = fullPath;
//           } else if (subAnswer === "__toggle_select__") {
//             if (selectedFolders.has(fullPath)) {
//               selectedFolders.delete(fullPath);
//             } else {
//               selectedFolders.add(fullPath);
//             }
//           }
//           // if cancel, do nothing
//         }
//       }
//     }
//   }
// }

async function navigateAndSelectFolders(startDir = process.cwd()) {
  const selectedFolders = new Set();
  let currentDir = path.resolve(startDir);
  const history = [];

  while (true) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const choices = [
      ...items.map(name => {
        const fullPath = path.join(currentDir, name);
        const relToRoot = path.relative(process.cwd(), fullPath);
        return {
          name: selectedFolders.has(relToRoot) ? `✅ ${name}` : name,
          value: name,
        };
      }),
    ];

    if (history.length > 0) {
      choices.unshift({ name: '⬅️  Back', value: '__back__' });
    }

    choices.push({ name: '✅ Confirm selection', value: '__confirm__' });

    const answer = await select({
      message: `Current directory: ${path.relative(process.cwd(), currentDir) || '.'}`,
      choices,
      loop: false,
    });

    if (answer === '__back__') {
      currentDir = history.pop();
    } else if (answer === '__confirm__') {
      return [...selectedFolders];
    } else {
      const fullPath = path.join(currentDir, answer);
      const relToRoot = path.relative(process.cwd(), fullPath);

      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        const subChoices = [
          { name: '📁 Open folder', value: '__open__' },
          {
            name: selectedFolders.has(relToRoot)
              ? '❌ Deselect this folder'
              : '✅ Select this folder',
            value: '__toggle_select__',
          },
          { name: '⬅️  Cancel', value: '__cancel__' },
        ];

        const subAnswer = await select({
          message: `What do you want to do with "${answer}"?`,
          choices: subChoices,
          loop: false,
        });

        if (subAnswer === '__open__') {
          history.push(currentDir);
          currentDir = fullPath;
        } else if (subAnswer === '__toggle_select__') {
          if (selectedFolders.has(relToRoot)) {
            selectedFolders.delete(relToRoot);
          } else {
            selectedFolders.add(relToRoot);
          }
        }
      }
    }
  }
}

module.exports = {
  logger,
  readCurrentDirectory,
  selectInDirectory,
  insertLinesAt,
  writeFile,
  readJson,
  runCommand,
  navigateAndSelectFolders,
};
