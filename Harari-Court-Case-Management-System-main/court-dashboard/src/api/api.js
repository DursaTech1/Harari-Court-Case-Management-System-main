import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export const registerUser = async (payload) => {
  const res = await fetch(`${API_BASE}/accounts/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json().catch(() => ({}))));
  return res.json();
};

export const loginUser = async (payload) => {
  const res = await fetch(`${API_BASE}/accounts/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json().catch(() => ({}))));
  return res.json(); // { access, refresh, user: { id, full_name, email, phone } }
};

export const logoutUser = () => {
  ['token', 'refresh', 'user', 'harariCourtUser'].forEach((k) => localStorage.removeItem(k));
};

export const getProfile = async () => {
  const res = await axios.get(`${API_BASE}/accounts/profile/`, authHeaders());
  return res.data;
};

export const updateProfile = async (payload) => {
  const res = await axios.put(`${API_BASE}/accounts/profile/`, payload, authHeaders());
  return res.data;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const fetchDashboardData = async () => {
  const res = await axios.get(`${API_BASE}/services/dashboard/stats/`, authHeaders());
  return res.data;
};

// ── Court Services catalogue (public) ────────────────────────────────────────

export const fetchCourtServices = async () => {
  const res = await axios.get(`${API_BASE}/services/list/`);
  return res.data;
};

// ── Service Requests — full CRUD ─────────────────────────────────────────────

/** List all requests for the logged-in user. Optional filter: ?service_name=X */
export const fetchMyRequests = async (serviceName = '') => {
  const params = serviceName ? { service_name: serviceName } : {};
  const res = await axios.get(`${API_BASE}/services/requests/`, { ...authHeaders(), params });
  return res.data;
};

/** Get a single request by ID */
export const fetchRequestById = async (id) => {
  const res = await axios.get(`${API_BASE}/services/requests/${id}/`, authHeaders());
  return res.data;
};

/** Create a new service request (FormData for file uploads) */
export const submitServiceRequest = async (_serviceName, formPayload) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_BASE}/services/requests/`, formPayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/** Update an existing request */
export const updateServiceRequest = async (id, formPayload) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(`${API_BASE}/services/requests/${id}/`, formPayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/** Delete a request */
export const deleteServiceRequest = async (id) => {
  await axios.delete(`${API_BASE}/services/requests/${id}/`, authHeaders());
};

/** Delete a single uploaded document */
export const deleteDocument = async (docId) => {
  await axios.delete(`${API_BASE}/services/documents/${docId}/`, authHeaders());
};

/** Get all appointments for the logged-in user */
export const fetchAppointments = async () => {
  const res = await axios.get(`${API_BASE}/services/appointments/`, authHeaders());
  return res.data;
};
