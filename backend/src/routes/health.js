const express = require('express')
const router = express.Router()
const pool = require('../db')

const ORIGINAL_RANGE = 315

router.get('/latest', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM battery_health ORDER BY recorded_at DESC LIMIT 1'
    )
    res.json(rows[0] || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT health_pct, rated_range, battery_level, recorded_at FROM battery_health ORDER BY recorded_at ASC LIMIT 100'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const [latest] = await pool.query(
      'SELECT health_pct, rated_range, recorded_at FROM battery_health ORDER BY recorded_at DESC LIMIT 1'
    )
    const [first] = await pool.query(
      'SELECT health_pct, recorded_at FROM battery_health ORDER BY recorded_at ASC LIMIT 1'
    )
    res.json({
      current_health: latest[0]?.health_pct || null,
      current_range: latest[0]?.rated_range || null,
      original_range: ORIGINAL_RANGE,
      first_recorded: first[0]?.health_pct || null,
      last_updated: latest[0]?.recorded_at || null
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
