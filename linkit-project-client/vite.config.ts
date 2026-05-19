import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cookiebotId = env.VITE_COOKIEBOT_DOMAIN_GROUP_ID ?? ''

  return {
    plugins: [
      react(),
      {
        name: 'inject-cookiebot',
        transformIndexHtml(html) {
          const cookiebotScript = cookiebotId
            ? `<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="${cookiebotId}" data-blockingmode="auto" type="text/javascript"></script>`
            : ''
          let out = html.replace(/<!--\s*VITE_INJECT_COOKIEBOT\s*-->/, cookiebotScript)
          if (!cookiebotId) {
            out = out.replace(
              /<script type="text\/plain" data-cookieconsent="marketing,statistics" data-src="([^"]+)"><\/script>/g,
              '<script async src="$1"></script>'
            )
            out = out.replace(
              /<script type="text\/plain" data-cookieconsent="marketing,statistics">/g,
              '<script>'
            )
          }
          return out
        },
      },
    ],
    server: {
      proxy: {
        '/sitemap.xml': {
          target: 'https://linkit-server.onrender.com',
          changeOrigin: true
        }
      }
    },
    preview: {
      proxy: {
        '/sitemap.xml': {
          target: 'https://linkit-server.onrender.com',
          changeOrigin: true
        }
      }
    }
  }
})
