const express = require('express')
const router = express.Router()
const pool = require('../db')

router.get('/', async (req, res) => {
  try {
    const [monthly] = await pool.query(`
      SELECT
        DATE_FORMAT(started_at, '%Y-%m') as month,
        DATE_FORMAT(started_at, '%b %Y') as label,
        COUNT(*) as trips,
        ROUND(SUM(miles_driven), 1) as miles,
        ROUND(SUM(autopilot_miles), 1) as ap_miles,
        ROUND(SUM(autopilot_miles) / NULLIF(SUM(miles_driven), 0) * 100, 1) as ap_pct
      FROM trips
      WHERE ended_at IS NOT NULL
      GROUP BY DATE_FORMAT(started_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `)

    const [charging] = await pool.query(`
      SELECT
        DATE_FORMAT(started_at, '%Y-%m') as month,
        ROUND(SUM(kwh_added), 2) as kwh,
        ROUND(SUM(cost_usd), 2) as cost,
        COUNT(*) as sessions
      FROM charging_sessions
      WHERE ended_at IS NOT NULL
      GROUP BY DATE_FORMAT(started_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `)

    const [snapStats] = await pool.query(`
      SELECT
        DATE_FORMAT(recorded_at, '%Y-%m') as month,
        ROUND(AVG(battery_level), 1) as avg_battery,
        ROUND(AVG(outside_temp) * 9/5 + 32, 1) as avg_temp_f
      FROM snapshots
      GROUP BY DATE_FORMAT(recorded_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `)

    const merged = monthly.map(m => {
      const c = charging.find(x => x.month === m.month) || {}
      const s = snapStats.find(x => x.month === m.month) || {}
      return { ...m, kwh: c.kwh, cost: c.cost, sessions: c.sessions, avg_battery: s.avg_battery, avg_temp_f: s.avg_temp_f }
    })

    res.json(merged)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
