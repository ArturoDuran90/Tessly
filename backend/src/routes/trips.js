const express = require('express')
const router = express.Router()
const pool = require('../db')

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, v.display_name,
        ROUND((t.autopilot_miles / NULLIF(t.miles_driven, 0)) * 100, 1) as autopilot_pct
       FROM trips t
       JOIN vehicles v ON t.vehicle_id = v.id
       WHERE t.ended_at IS NOT NULL
       ORDER BY t.started_at DESC
       LIMIT 50`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) as total_trips,
        ROUND(SUM(miles_driven), 1) as total_miles,
        ROUND(SUM(autopilot_miles), 1) as total_ap_miles,
        ROUND((SUM(autopilot_miles) / NULLIF(SUM(miles_driven), 0)) * 100, 1) as ap_pct
       FROM trips WHERE ended_at IS NOT NULL`
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
