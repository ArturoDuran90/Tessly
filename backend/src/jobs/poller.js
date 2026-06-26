const cron = require('node-cron')
const pool = require('../db')
const { getVehicles, getVehicleData } = require('../tesla/client')

async function ensureVehicle(vin, displayName) {
  const [rows] = await pool.query('SELECT id FROM vehicles WHERE vin = ?', [vin])
  if (rows.length > 0) return rows[0].id
  const [result] = await pool.query(
    'INSERT INTO vehicles (vin, display_name, model) VALUES (?, ?, ?)',
    [vin, displayName, 'Model 3']
  )
  return result.insertId
}


async function handleBatteryHealth(vehicleId, data) {
  const charge = data.charge_state
  if (!charge?.battery_level || !charge?.battery_range) return
  if (charge.battery_level < 90) return

  const ORIGINAL_RANGE = 315
  const healthPct = (charge.battery_range / charge.battery_level * 100 / ORIGINAL_RANGE * 100).toFixed(2)

  const [last] = await pool.query(
    'SELECT recorded_at FROM battery_health WHERE vehicle_id = ? ORDER BY recorded_at DESC LIMIT 1',
    [vehicleId]
  )

  const lastRecorded = last[0]?.recorded_at
  const hoursSinceLast = lastRecorded
    ? (Date.now() - new Date(lastRecorded).getTime()) / 3600000
    : 999

  if (hoursSinceLast < 6) return

  await pool.query(
    'INSERT INTO battery_health (vehicle_id, rated_range, battery_level, health_pct) VALUES (?, ?, ?, ?)',
    [vehicleId, charge.battery_range, charge.battery_level, healthPct]
  )
  console.log('[poller] battery health recorded: ' + healthPct + '%')
}

async function handleTrip(vehicleId, data) {
  const drive = data.drive_state
  const autopilot = data.autopilot_data
  if (!drive?.odometer) return

  const autopilotActive = autopilot?.autopilot_state && autopilot.autopilot_state !== 'Off'
  const autopilotState = autopilot?.autopilot_state || 'Off'

  const [lastSnap] = await pool.query(
    'SELECT odometer, latitude, longitude FROM snapshots WHERE vehicle_id = ? ORDER BY recorded_at DESC LIMIT 1',
    [vehicleId]
  )

  const prev = lastSnap[0]
  if (!prev) return

  const milesDriven = drive.odometer - prev.odometer

  if (milesDriven > 0.1) {
    const [openTrip] = await pool.query(
      'SELECT id FROM trips WHERE vehicle_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
      [vehicleId]
    )

    if (openTrip.length === 0) {
      await pool.query(
        'INSERT INTO trips (vehicle_id, start_lat, start_lng, start_odometer, started_at, autopilot_miles) VALUES (?, ?, ?, ?, NOW(), 0)',
        [vehicleId, prev.latitude, prev.longitude, prev.odometer]
      )
      console.log('[poller] trip started')
    } else if (autopilotActive && milesDriven > 0) {
      await pool.query(
        'UPDATE trips SET autopilot_miles = autopilot_miles + ? WHERE id = ?',
        [milesDriven, openTrip[0].id]
      )
    }
  } else {
    const [openTrip] = await pool.query(
      'SELECT id, start_odometer, autopilot_miles FROM trips WHERE vehicle_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
      [vehicleId]
    )

    if (openTrip.length > 0) {
      const miles = drive.odometer - openTrip[0].start_odometer
      await pool.query(
        `UPDATE trips SET end_lat=?, end_lng=?, end_odometer=?, miles_driven=?, ended_at=NOW()
         WHERE id=?`,
        [drive.latitude, drive.longitude, drive.odometer, miles, openTrip[0].id]
      )
      console.log('[poller] trip ended, ' + miles.toFixed(1) + ' miles, ' + (openTrip[0].autopilot_miles || 0).toFixed(1) + ' AP miles')
    }
  }
}

async function handleCharging(vehicleId, data) {
  const charge = data.charge_state
  const drive = data.drive_state
  if (!charge) return

  const isCharging = charge.charging_state === 'Charging'

  const [openSession] = await pool.query(
    'SELECT id FROM charging_sessions WHERE vehicle_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
    [vehicleId]
  )

  if (isCharging && openSession.length === 0) {
    await pool.query(
      'INSERT INTO charging_sessions (vehicle_id, latitude, longitude, charge_limit, started_at) VALUES (?, ?, ?, ?, NOW())',
      [vehicleId, drive?.latitude, drive?.longitude, charge.charge_limit_soc]
    )
    console.log('[poller] charging session started')
  }

  if (!isCharging && openSession.length > 0) {
    const kwh = charge.charge_energy_added || 0
    const cost = kwh * parseFloat(process.env.ELECTRICITY_RATE || 0.12)
    await pool.query(
      'UPDATE charging_sessions SET kwh_added=?, cost_usd=?, ended_at=NOW() WHERE id=?',
      [kwh, cost.toFixed(2), openSession[0].id]
    )
    console.log('[poller] charging session ended, ' + kwh + ' kWh added')
  }
}

async function poll() {
  try {
    console.log('[poller] polling Tesla API...')
    const vehicles = await getVehicles()
    if (!vehicles) return

    for (const vehicle of vehicles) {
      const vehicleId = await ensureVehicle(vehicle.vin, vehicle.display_name)

      if (vehicle.state === 'offline' || vehicle.state === 'asleep') {
        console.log('[poller] vehicle is ' + vehicle.state + ', skipping')
        continue
      }

      const data = await getVehicleData(vehicle.id)
      if (!data) continue

      const charge = data.charge_state
      const drive = data.drive_state
      const climate = data.climate_state
      const autopilot = data.autopilot_data
      const autopilotActive = autopilot?.autopilot_state && autopilot.autopilot_state !== 'Off'

      await handleTrip(vehicleId, data)
      await handleBatteryHealth(vehicleId, data)
      await handleCharging(vehicleId, data)

      await pool.query(
        `INSERT INTO snapshots
          (vehicle_id, battery_level, rated_range, odometer, latitude, longitude, is_charging, is_plugged_in, outside_temp, autopilot_active, autopilot_state)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vehicleId,
          charge?.battery_level,
          charge?.battery_range,
          drive?.odometer,
          drive?.latitude,
          drive?.longitude,
          charge?.charging_state === 'Charging',
          charge?.charging_state !== 'Disconnected',
          climate?.outside_temp,
          autopilotActive || false,
          autopilot?.autopilot_state || 'Off'
        ]
      )

      console.log('[poller] snapshot saved — AP: ' + (autopilot?.autopilot_state || 'Off'))
    }
  } catch (err) {
    console.error('[poller] error:', err.message)
  }
}

cron.schedule('*/5 * * * *', poll)
poll()
console.log('[poller] scheduler started')
