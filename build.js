const fs = require('fs-extra')
const path = require('path')
const config = require('./config.pwa')
if(config.minify) const minify = require('minify')

const coreFiles = ['dom.js', 'loader.js']

function emptyFolder(path) {
  try {
    fs.rmdirSync(path, {recursive: true})
  }catch(e){}
  fs.mkdirSync(path)
}

async function minifyFile(filePath) {
  try {
    return await fs.writeFile(filePath, await minify(filePath))
  } catch(e) {
    return false
  }
}

async function minifyFiles(sourceMap, folder) {
  for (key in sourceMap) {
    const basePath = path.join(folder, key === 'root' ? '' : key)
    for (i in sourceMap[key]) {
      await minifyFile(path.join(basePath, sourceMap[key][i]))
    }
  }
}

async function filesInFolder(folder) {
  let returnArray = []
  let files = await fs.readdir(folder)
  for (i in files) {
    if (!files[i].includes('.')) continue
    returnArray.push(files[i])
  }
  return returnArray
}

async function getSourceFiles(src) {
  return {
    root: await filesInFolder(src),
    css: await filesInFolder(path.join(src, 'css')),
    js: await filesInFolder(path.join(src, 'js'))
  }
}

async function copyCoreFilesToDist(files) {
  let injectScripts = ''
  files.js = coreFiles.concat(files.js)
  for (i in coreFiles) {
    injectScripts += `<script type="text/javascript" src=\"${config.url.base}/js/${coreFiles[i]}\"></script>`
    await fs.copyFile(path.join(__dirname, coreFiles[i]), path.join(__dirname, 'dist', 'js', coreFiles[i]))
  }
  await injectScriptsIntoIndex(injectScripts)
}

async function replaceEnvInFile(file, doGetFile) {
  let content = doGetFile ? (await fs.readFile(file)) : file
  for (key in config.env) {
    content = content.replace(new RegExp('{{'+key.toUpperCase()+'}}'), config.env[key])
  }
  return doGetFile ? fs.writeFile(file, content) : content
}

async function injectScriptsIntoIndex(html) {
  const indexLocation = path.join(__dirname, 'dist', 'index.html')
  let indexHtml = (await fs.readFile(indexLocation)).toString()
    .replace('{{INJECTEDSCRIPTS}}', html)
    .replace('{{MANIFEST}}', `<link rel="manifest" href="manifest.webmanifest">`)
  indexHtml = await replaceEnvInFile(indexHtml)
  await fs.writeFile(indexLocation, indexHtml)
}

async function replaceVariablesInDist(files) {
  for (key in files) {
    
  }
}

async function init() {
  const src = path.join(__dirname, 'src')
  const dist = path.join(__dirname, 'dist')
  emptyFolder(dist)
  const files = await getSourceFiles(src)
  fs.copySync(src, dist)
  await copyCoreFilesToDist(files)
  await replaceVariablesInDist(files)
  if(config.minify) await minifyFiles(files, dist)
}

init()