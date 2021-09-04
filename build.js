const fs = require('fs')
const path = require('path')

function emptyFolder(path) {
  fs.rmdirSync(path, {recursive: true})
  fs.mkdirSync(path)
}

async function getSourceFiles(prefix) {
  return new Promise((resolve, reject)=>{
    let sources = {
      root: []
    }
    fs.readdir(path, (e, list)=>{
      list.map((f)=>{
        const isFolder = !f.includes('.')
        if (isFolder) {
          // Traverse folder
          sources[f] = []
        } else {
          // Add to root
          sources.root.push(`${prefix}/${f}`)
        }
      })
    })
    resolve(sources)
  })
}


async function init() {
  emptyFolder(path.join(__dirname, 'dist'))
  const test = await getSourceFiles('./', path.join(__dirname, 'src'))
  console.log(test)
}

init()