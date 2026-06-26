require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

app.get('/ping', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', require('./routes/auth'))
app.use('/commands', require('./routes/commands'))
app.use('/stats', require('./routes/stats'))
app.use('/vehicles', require('./routes/vehicles'))
app.use('/snapshots', require('./routes/snapshots'))
app.use('/battery-health', require('./routes/health'))
app.use('/trips', require('./routes/trips'))
app.use('/charging', require('./routes/charging'))

require('./jobs/poller')

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
