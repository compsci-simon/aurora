const express = require('express')

const app = express()

app.get('/api/users', (req, res) => {
  res.json({ message: 'GET /api/users endpoint'})
})

const port = 3000
app.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`)
})