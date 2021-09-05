const fs = require('fs-extra')
const path = require('path')

function emptyFolder(path) {
  try {
    fs.rmdirSync(path, {recursive: true})
  }catch(e){}
  fs.mkdirSync(path)
}

async function filesInFolder(path) {
  let returnArray = []
  let files = await fs.readdir(path)
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

async function init() {
  const src = path.join(__dirname, 'src')
  const dist = path.join(__dirname, 'dist')
  emptyFolder(dist)
  const files = await getSourceFiles(src)
  return false
  emptyFolder(path.join(__dirname, 'dist'))
  const test = await getSourceFiles('./', path.join(__dirname, 'src'))
  console.log(test)
}

init()