const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'  // Changed to bind to all interfaces
const port = process.env.PORT || 3000

console.log(`Starting server on ${hostname}:${port}`)
console.log(`Environment: ${process.env.NODE_ENV}`)

// Check if .next directory exists, if not, run build
const nextDir = path.join(__dirname, '.next')
if (!fs.existsSync(nextDir)) {
  console.log('Build directory not found. Installing dependencies and running build...')
  
  // First install dependencies
  const installProcess = spawn('npm', ['install'], {
    stdio: 'inherit',
    shell: true
  })
  
  installProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Install failed with code:', code)
      process.exit(1)
    }
    console.log('Dependencies installed successfully')
    
    // Then run build
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
      
      // Verify .next directory was created
      if (fs.existsSync(nextDir)) {
        console.log('.next directory confirmed to exist')
        startServer()
      } else {
        console.error('.next directory was not created after build')
        process.exit(1)
      }
    })
    
    buildProcess.on('error', (err) => {
      console.error('Build process error:', err)
      process.exit(1)
    })
  })
  
  installProcess.on('error', (err) => {
    console.error('Install process error:', err)
    process.exit(1)
  })
} else {
  console.log('.next directory already exists, starting server directly')
  startServer()
}

function startServer() {
  console.log('Initializing Next.js app...')
  
  try {
    const app = next({ dev, hostname, port })
    const handle = app.getRequestHandler()

    console.log('Preparing Next.js app...')
    app.prepare().then(() => {
      console.log('Next.js app prepared, creating HTTP server...')
      
      const server = createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true)
          await handle(req, res, parsedUrl)
        } catch (err) {
          console.error('Error occurred handling', req.url, err)
          res.statusCode = 500
          res.end('internal server error')
        }
      })
      
      server.once('error', (err) => {
        console.error('Server error:', err)
        process.exit(1)
      })
      
      server.listen(port, hostname, () => {
        console.log(`✅ Server successfully started on http://${hostname}:${port}`)
        console.log(`✅ Ready to accept connections`)
      })
      
    }).catch((err) => {
      console.error('Error preparing Next.js app:', err)
      process.exit(1)
    })
    
  } catch (err) {
    console.error('Error creating Next.js app:', err)
    process.exit(1)
  }
} 