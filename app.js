const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Check if .next directory exists, if not, run build
const nextDir = path.join(__dirname, '.next')
if (!fs.existsSync(nextDir)) {
  console.log('Build directory not found. Running build...')
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true
  })
  
  buildProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Build failed with code:', code)
      process.exit(1)
    }
    console.log('Build completed successfully')
    startServer()
  })
} else {
  startServer()
}

function startServer() {
  const app = next({ dev, hostname, port })
  const handle = app.getRequestHandler()

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })
      .once('error', (err) => {
        console.error(err)
        process.exit(1)
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
      })
  })
} 