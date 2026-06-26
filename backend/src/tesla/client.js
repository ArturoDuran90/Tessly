const pool = require('../db');

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const data = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.TESLA_CLIENT_ID,
    client_secret: process.env.TESLA_CLIENT_SECRET,
    refresh_token: process.env.TESLA_REFRESH_TOKEN,
    scope: 'openid vehicle_device_data vehicle_cmds vehicle_charging_cmds offline_access'
  });
  const res = await fetch('https://auth.tesla.com/oauth2/v3/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data
  });
  const json = await res.json();
  cachedToken = json.access_token;
  tokenExpiry = Date.now() + (json.expires_in - 300) * 1000;
  return cachedToken;
}

async function getVehicles() {
  const token = await getAccessToken();
  const res = await fetch('https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const json = await res.json();
  return json.response;
}

async function getVehicleData(vehicleId) {
  const token = await getAccessToken();
  const res = await fetch('https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/' + vehicleId + '/vehicle_data?endpoints=charge_state%3Bdrive_state%3Bclimate_state%3Bvehicle_state%3Bautopilot_data', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const json = await res.json();
  return json.response;
}

module.exports = { getAccessToken, getVehicles, getVehicleData };
