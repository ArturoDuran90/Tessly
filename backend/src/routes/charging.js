const express = require('express')
const router = express.Router()
const pool = require('../db')

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, v.display_name
       FROM charging_sessions c
       JOIN vehicles v ON c.vehicle_id = v.id
       WHERE c.ended_at IS NOT NULL
       ORDER BY c.started_at DESC
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
        COUNT(*) as total_sessions,
        ROUND(SUM(kwh_added), 2) as total_kwh,
        ROUND(SUM(cost_usd), 2) as total_cost,
        ROUND(AVG(kwh_added), 2) as avg_kwh
       FROM charging_sessions
       WHERE ended_at IS NOT NULL`
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
