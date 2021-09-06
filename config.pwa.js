module.exports = {
  env: {
    title: 'Scan App PWA',
    author: 'Tobias Andre Andersen'
  },
  url: {
    base: process.env.SCAN_URL_BASE || 'http://localhost:1234', // Absolute path for assets to load from
    api: process.env.SCAN_URL_API || 'http://localhost:8000' // Absolute path for api access. Optional.
  },
  minify: false // Set true to minify js, html, css
}