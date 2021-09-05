const url = "https://rockay.dev/api/"

const validate = {
  email: (str) => {
    return /\S+@\S+\.\S+/.test(str)
  },
  password: (str) => {
    return str.length > 3
  }
}

const emailInput = '#intro input[type="email"]'
const passwordInput = '#intro input[type="password"]'
const validStyle = 'background-color: var(--attention-dark);'
const focusStyle = 'background-color: var(--background-dark);'

function testAll () {dom.style('#intro button', (!validate.email(document.querySelector(emailInput).value) || !validate.password(document.querySelector(passwordInput).value)) ? 'opacity: 0.5; pointer-events: none;' : '')}

function setActiveInput(type, fx) {
  const el = `#intro input[type="${type}"]`
  dom.listen(el, 'input', (e) => {
    dom.style(e, fx(e.value) ? validStyle : focusStyle)
    testAll()
  })
  dom.listen(el, 'focus', (e) => {dom.style(e, !fx(e.value) ? focusStyle : '')})
  dom.listen(el, 'blur', (e) => {dom.style(e, fx(e.value) ? validStyle : '')})
}

Object.keys(validate).forEach((type)=>{
  setActiveInput(type, validate[type])
})

dom.focus(emailInput)

const http = axios.create({});

window.api = async({ method, data, url, formData }) => {
  return new Promise(function (resolve, reject) {
    http({method,data,url,formData,
        headers: (localStorage.getItem('jwt') ? {
          authorization: 'Bearer: ' + localStorage.getItem('jwt')
        } : {}),
      })
      .then((result) => {
        if (!result.data) return reject('No data returned')
        if (!result.data.ok) return reject(result.data.error)
        if (result.data.pagination) return resolve(result.data)
        resolve(result.data.data || result.data)
      })
      .catch((error) => {reject(new Error(error))})
  })
}

let startedQR = false

async function startQR() {
  Quagga.init({
    inputStream : {
      name : "Live",
      type : "LiveStream",
      constraints: {
        width: {min: window.innerWidth},
        height: {min: window.innerHeight},
        facingMode: "environment",
        aspectRatio: {min: 1, max: 2}
      }
    }
  }, function(err) {
    if (err) {
        return alert(err);
    }
    var track = Quagga.CameraAccess.getActiveTrack();
    var capabilities = {};
    if (typeof track.getCapabilities === 'function') {
        capabilities = track.getCapabilities();
    }
    Quagga.start();
    Quagga.onProcessed(main.onBarcode)
  });
}

window.main = {
  intro: () => {
    dom.class('section', 'closed')
    if(localStorage.getItem('jwt')) return main.dashboard()
    testAll()
    dom.class('section#intro', 'shown')
  },
  dashboard: () => {
    startQR()
    dom.html('#response', 'Point camera towards barcode')
    dom.class('section', 'closed')
    dom.class('section#dashboard', 'shown')
  },
  login: async () => {
    try {
      const data = await api({
        method: 'post',
        url: url + 'user/login/',
        data: {
          email: dom.el(emailInput).value,
          password: dom.el(passwordInput).value
        }
      })
      localStorage.setItem('email', data.email)
      localStorage.setItem('jwt', data.token)
      main.dashboard()
    } catch(e) {
      dom.html('#intro .error', e)
      main.intro()
    }
  },
  addCode: (code) => {
    localStorage.setItem('repo', [...main.getRepo(), ...[code]])
  },
  codeInRepo: (code) => {
    const list = main.getRepo()
    for (let i = 0; i < list.length; i++) {
      if (list[i] == code) return true
    }
    return false
  },
  getRepo: () => {
    const repoString = localStorage.getItem('repo')
    if (!repoString) {
      localStorage.setItem('repo', '[]')
      return []
    }
    return JSON.parse(repoString)
  },
  onBarcode: async (payload) => {
    if (!payload) return false
    if (!payload.codeResult) return false
    const splitCode = payload.codeResult.split('-')
    if (splitCode[0] !== 'RA' || !splitCode[splitCode.length - 1] !== 'DK') return false
    const realcode = splitCode[1]
    if(!main.codeInRepo(realCode)) {
      window.navigator.vibrate(200)
      main.addCode(realCode)
    } 
    return false
    window.lastScan = new Date().getTime() * 10
    const str = payload.codeResult.code
    setTimeout(async()=>{
      const confirmShipping = await confirm(`Set order #${str} as shipping?`)
      window.lastScan = new Date().getTime()
      if (confirmShipping) {
        let data = ''
        try {
          data = await api({
            method: 'post',
            url: url + 'scan/'+str
          })
        } catch(e) {
          data = e
        }
        dom.html('#response', data)
        setTimeout(()=>{dom.html('#response', 'Point camera towards barcode')}, 2000)
      }
      setTimeout(()=>{dom.style('body','')}, 200);
    },200)
  },
  logout: () => {localStorage.removeItem('jwt'); localStorage.removeItem('email'); window.location.reload();}
}

window.lastScan = new Date().getTime()

window.main.intro()