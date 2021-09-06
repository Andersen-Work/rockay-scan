const loadable = ['axios.js', 'qr.js', 'main.js']
const loadScreen = '#loader'
const tooltip = loadScreen + ' .help'

const loader = {
  script: (src) => {
    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        var s,r,t;
        r = false;
        s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = src;
        s.onload = s.onreadystatechange = function() {
          if ( !r && (!this.readyState || this.readyState == 'complete') ) { r = true; resolve(); }
        };
        t = document.getElementsByTagName('script')[0];
        t.parentNode.insertBefore(s, t);
      }, 1)
    })
  }
}

window.deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  window.deferredPrompt = e;
});

async function register() {
  return new Promise((resolve, reject)=>{
    if('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/scan/sw.js')
        .then(function() { resolve(true) });
    } else {
      resolve(false)
    }
  })
}

async function installApp() {
  const { outcome } = await window.deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    deferredPrompt.installPrompt = null;
    dom.html(tooltip, 'Thank you! Reloading...')
    setTimeout(window.location.reload, 1000)
  } else {
    setTimeout(window.location.reload, 5000)
    dom.html(tooltip, 'You must click install to continue...<br/>Reloading in 5 seconds...')
  }
}

function isInstalled() {
  return true // Remove if fix found...
  return window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: fullscreen)').matches ||
  window.matchMedia('(display-mode: minimal-ui)').matches
}

async function setup() {
  const registered = await register()
  if (!registered) {
    return dom.html(tooltip, 'Could not register service worker...')
  }
  if (!isInstalled()) {
    dom.html(tooltip, 'Press anywhere to install...')
    dom.style(tooltip, 'cursor: pointer; font-family: "bold";')
    dom.listen('body', 'click', installApp)
    return true
  }
  for (src in loadable) {
    dom.html(tooltip, `Loading ${loadable[src]}...`)
    await loader.script(`js/${loadable[src]}`)
  }
  dom.html(tooltip, '')
  dom.class(loadScreen, 'animate closed')
}

setup()