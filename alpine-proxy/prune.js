const fs = require('fs')
const path = require('path')

const REMOVE_DIRS = [
  '__tests__',
  'docs',
  'doc',
  'test',
  'tests',
  'powered-test',
  '.idea',
  '.vscode',
  'website',
  'example',
  'examples',
  'coverage',
  '.nyc_output',
  '.circleci',
  '.github',
]

const REMOVE_FILES = [
  '.DS_Store',
  '.gitattributes',
  '.editorconfig',
  '.npmrc',
  '.npmignore',
  '.gitlab-ci.yml',
  'circle.yml',
  '.coveralls.yml',
  'CHANGES',
  'changelog',
  'license',
  'licence',
  'AUTHORS',
  'CONTRIBUTORS',
  '.yarn-integrity',
  '.yarnclean',
  'Jenkinsfile',
  'Makefile',
  'Gulpfile.js',
  'Gruntfile.js',
  'gulpfile.js',
  '.tern-project',
  '.eslintrc',
  'eslint',
  '.eslintrc.js',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintignore',
  '.stylelintrc',
  'stylelint.config.js',
  '.stylelintrc.json',
  '.stylelintrc.yaml',
  '.stylelintrc.yml',
  '.stylelintrc.js',
  '.htmllintrc',
  'htmllint.js',
  '.lint',
  '.jshintrc',
  '.flowconfig',
  '.documentup.json',
  '.yarn-metadata.json',
  '.travis.yml',
  'appveyor.yml',
  '_config.yml',
  '.babelrc',
  '.yo-rc.json',
  'jest.config.js',
  'karma.conf.js',
  'wallaby.js',
  'wallaby.conf.js',
  'prettier.config.js',
  '.appveyor.yml',
  'tsconfig.json',
  'tslint.json',
]
const REMOVE_FILES_PATTERNS = ['.prettierrc*', '*.markdown', '*.md', '*.mkd', '*.swp', 'LICENCE*', 'LICENSE*']
const REMOVE_FILES_REGEX_STR = `^(${REMOVE_FILES_PATTERNS.map((regex) =>
  regex.replace('.', '\\.').replace('*', '.*')
).join('|')})$`
const REMOVE_FILES_REGEX = new RegExp(REMOVE_FILES_REGEX_STR)

const isDeployMode = process.argv.includes('--deploy')

const CURR_DIR = process.cwd()
let reduceSize = 0

const getAllFiles = function (dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []
  for (const file of files) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
    } //
    else {
      arrayOfFiles.push(path.join(dirPath, file))
    }
  }
  return arrayOfFiles
}
const getTotalSize = function (directoryPath) {
  const arrayOfFiles = getAllFiles(directoryPath)
  let totalSize = 0
  arrayOfFiles.forEach(function (filePath) {
    totalSize += fs.statSync(filePath).size
  })
  return totalSize
}

const logMessages = []
const log = (filename, type) => {
  if (fs.statSync(filename).isDirectory()) {
    reduceSize += getTotalSize(filename)
  } //
  else {
    reduceSize += fs.statSync(filename).size
  }
  logMessages.push(`remove ${type} : ${filename.replace(CURR_DIR, '')}`)
}

const removeFiles = (parent, target) => {
  const targetDir = path.join(parent, target)
  if (!fs.statSync(targetDir).isDirectory()) {
    return
  }
  const files = fs.readdirSync(targetDir)
  for (const filename of files) {
    if (filename === 'node_modules') {
      remove(targetDir, filename)
      continue
    }
    const file = path.join(targetDir, filename)
    if (!fs.existsSync(file)) {
      continue
    }
    const isDir = fs.statSync(file).isDirectory()
    if (isDir) {
      removeFiles(targetDir, filename)
    } //
    else if (REMOVE_FILES.includes(filename) || REMOVE_FILES_REGEX.test(filename)) {
      log(file, 'file')
      fs.unlinkSync(file)
    } //
    else if ((isDeployMode ? true : !filename.endsWith('.d.ts')) && filename.endsWith('.ts')) {
      log(file, 'file')
      fs.unlinkSync(file)
    }
  }
}
const remove = (parent, target) => {
  if (target === '.bin') return
  const targetDir = path.join(parent, target)
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    return
  }
  const files = fs.readdirSync(targetDir)
  for (const filename of files) {
    if (filename === 'node_modules') {
      remove(path.join(parent, target), filename)
      continue
    }
    const file = path.join(targetDir, filename)
    if (!fs.existsSync(file)) {
      continue
    }
    const isDir = fs.statSync(file).isDirectory()
    if (isDir && REMOVE_DIRS.includes(filename)) {
      log(file, 'dir')
      fs.rmSync(file, { recursive: true })
    } //
    else if (isDir) {
      removeFiles(targetDir, filename)
    } //
    else if (!isDir && (REMOVE_FILES.includes(filename) || REMOVE_FILES_REGEX.test(filename))) {
      log(file, 'file')
      fs.unlinkSync(file)
    } //
  }
}

const nodeModulesDir = path.join(__dirname, 'node_modules')
const node_modules = fs.readdirSync(nodeModulesDir)
for (const dir of node_modules) {
  remove(nodeModulesDir, dir)
}

console.log(`node_module reduce size: ${reduceSize / 1024 / 1024} MB`)
const writeLogFile = process.argv.includes('--log')
if (writeLogFile) {
  fs.writeFileSync(path.join(__dirname, 'remove.log'), logMessages.join('\n'))
}
