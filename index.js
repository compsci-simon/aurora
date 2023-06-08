const express = require('express')
const { exec } = require('child_process')
const path = require('path')

const app = express()

app.get('/api/users', (req, res) => {
  let location = req.query.path
  if (location.charAt(location.length - 1) !== '/') {
    location += '/'
  }
  exec(`for file in ${location}*; do stat "$file"; done`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`)
      res.json({ 
        message: `Error executing command: ${error}`
      })
    } else if (stdout) {
      const files = stdout.split('\n').filter(file => file).map(file => {
        const parts = file.split(' ').filter(item => item)
        const full_path = parts[parts.length - 1]
        const filename = path.basename(full_path)
        let file_mode = parts[2].charAt(0)
        let file_type = ''
        if (file_mode === '-') {
          file_type = 'file'
        } else if (file_mode === 'd') {
          file_type = 'directory'
        } else if (file_mode === 'l') {
          file_type = 'symbolic link'
        }
        return {
          filename,
          full_path,
          file_size: parts[7] + ' bytes',
          file_type,
          created_date: `${parts[20].replace('"', '')} ${parts[21]} ${parts[22]} ${parts[23].replace('"', '')}`
        }
      })
      res.json({
        files,
        path: location
      })
    } else if (stderr) {
      console.log('stderr', stderr)
      res.json({ 
        message: 'Error executing command on the given path',
        stderr
      })
    }
  })
})

const port = 3000
app.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`)
})