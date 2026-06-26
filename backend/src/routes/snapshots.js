const express = require('express')
const router = express.Router()
const pool = require('../db')

router.get('/latest', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, v.display_name, v.vin
       FROM snapshots s
       JOIN vehicles v ON s.vehicle_id = v.id
       ORDER BY s.recorded_at DESC LIMIT 1`
    )
    res.json(rows[0] || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT battery_level, rated_range, recorded_at
       FROM snapshots ORDER BY recorded_at DESC LIMIT 48`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/heatmap', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT latitude, longitude FROM snapshots
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL
       ORDER BY recorded_at DESC LIMIT 2000`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
