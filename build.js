const fs = require('fs-extra')
const path = require('path')

function emptyFolder(path) {
  fs.rmdirSync(path, {recursive: true})
  fs.mkdirSync(path)
}

async function getSourceFiles(path) {
  return new Promise((resolve, reject)=>{
    walk(path, resolve)
  })
}

var walk = function(dir, done) {
  var results = []
  fs.readdir(dir, function(err, list) {
    if (err) return done(err)
    var i = 0
    (function next() {
      var file = list[i++]
      if (!file) return done(null, results)
      file = path.resolve(dir, file)
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res)
            next()
          })
        } else {
          results.push(file)
          next()
        }
      })
    })()
  })
}

async function init() {
  const files = await getSourceFiles(__dirname)
  console.log(files)
  return false
  emptyFolder(path.join(__dirname, 'dist'))
  const test = await getSourceFiles('./', path.join(__dirname, 'src'))
  console.log(test)
}

init()