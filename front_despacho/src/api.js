import axios from 'axios';

// Todas las rutas pasan por nginx, que las redirige al microservicio correcto.
// En desarrollo el vite.config.js replica el mismo rewrite.
//   /api/ventas/v1/ventas    → backend-ventas:8080  → /api/v1/ventas
//   /api/despachos/v1/despachos → backend-despachos:8081 → /api/v1/despachos

const VENTAS_BASE    = '/api/ventas/v1/ventas';
const DESPACHOS_BASE = '/api/despachos/v1/despachos';

const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

/* ── VENTAS ───────────────────────────────────────────────── */

export const getVentas = () =>
  axios.get(VENTAS_BASE, { headers }).then(r => r.data);

export const createVenta = (data) =>
  axios.post(VENTAS_BASE, data, { headers }).then(r => r.data);

export const updateVenta = (id, data) =>
  axios.put(`${VENTAS_BASE}/${id}`, data, { headers }).then(r => r.data);

export const deleteVenta = (id) =>
  axios.delete(`${VENTAS_BASE}/${id}`, { headers }).then(r => r.data);

/* ── DESPACHOS ───────────────────────────────────────────── */

export const getDespachos = () =>
  axios.get(DESPACHOS_BASE, { headers }).then(r => r.data);

export const createDespacho = (data) =>
  axios.post(DESPACHOS_BASE, data, { headers }).then(r => r.data);

export const updateDespacho = (id, data) =>
  axios.put(`${DESPACHOS_BASE}/${id}`, data, { headers }).then(r => r.data);

export const deleteDespacho = (id) =>
  axios.delete(`${DESPACHOS_BASE}/${id}`, { headers }).then(r => r.data);
