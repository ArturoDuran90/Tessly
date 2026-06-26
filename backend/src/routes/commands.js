const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { getAccessToken } = require('../tesla/client')

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'No token' })
  try {
    jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

async function sendVehicleCommand(vehicleId, command, body = {}) {
  const token = await getAccessToken()
  const res = await fetch(
    'https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/' + vehicleId + '/command/' + command,
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )
  return res.json()
}

const COMMANDS = {
  lock: 'door_lock',
  unlock: 'door_unlock',
  climate_on: 'auto_conditioning_start',
  climate_off: 'auto_conditioning_stop',
  charge_start: 'charge_start',
  charge_stop: 'charge_stop',
  honk: 'honk_horn',
  flash_lights: 'flash_lights'
}

Object.entries(COMMANDS).forEach(([route, command]) => {
  router.post('/' + route, authMiddleware, async (req, res) => {
    try {
      const { vehicle_id } = req.body
      const result = await sendVehicleCommand(vehicle_id, command)
      res.json({ ok: result.response?.result === true, result })
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message })
    }
  })
})

module.exports = router
