const GA4_ID = "G-P1N01HPY7X"
const GOOGLE_ADS_ID = "AW-17878189526"
const GTM_ID = "GTM-NZBXLVTR"
const GTAG_JS_URL = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`

let gtagLibraryLoaded = false
let gtmLoaded = false

type ConsentFlags = {
  statistics: boolean
  marketing: boolean
}

function gtag(...args: unknown[]) {
  if (typeof window.gtag === "function") {
    window.gtag(...args)
    return
  }
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}

function loadScript(src: string, id: string): Promise<void> {
  if (document.getElementById(id)) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.id = id
    script.async = true
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

function loadGtagLibrary() {
  if (gtagLibraryLoaded) return Promise.resolve()
  return loadScript(GTAG_JS_URL, "linkit-gtag-js").then(() => {
    gtagLibraryLoaded = true
    gtag("js", new Date())
  })
}

function loadGtm() {
  if (gtmLoaded) return
  gtmLoaded = true

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" })

  const iframe = document.createElement("iframe")
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`
  iframe.height = "0"
  iframe.width = "0"
  iframe.style.display = "none"
  iframe.style.visibility = "hidden"
  iframe.setAttribute("aria-hidden", "true")
  document.body.appendChild(iframe)

  void loadScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`, "linkit-gtm-js")
}

export function updateConsentMode(consent: ConsentFlags) {
  gtag("consent", "update", {
    analytics_storage: consent.statistics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  })
}

export function applyTrackingConsent(consent: ConsentFlags) {
  updateConsentMode(consent)

  const allowsTracking = consent.statistics || consent.marketing
  if (!allowsTracking) return

  void loadGtagLibrary().then(() => {
    if (consent.statistics) {
      gtag("config", GA4_ID)
    }
    if (consent.marketing) {
      gtag("config", GOOGLE_ADS_ID)
    }
    loadGtm()
  })
}
