const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const PASSWORD = process.env.APP_PASSWORD || 'tessly'

router.post('/login', (req, res) => {
  const { password } = req.body
  if (password !== PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' })
  }
  const token = jwt.sign({ auth: true }, process.env.JWT_SECRET, { expiresIn: '30d' })
  res.json({ token })
})

router.post('/verify', (req, res) => {
  const { token } = req.body
  try {
    jwt.verify(token, process.env.JWT_SECRET)
    res.json({ valid: true })
  } catch {
    res.status(401).json({ valid: false })
  }
})

module.exports = router
