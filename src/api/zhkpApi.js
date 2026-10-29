const TOKEN_KEY = 'zhkp_admin_token';

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const { method = 'GET', body, token } = options;
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error || 'Помилка API');
    error.details = data?.details;
    throw error;
  }
  return data;
}

export async function getSite() {
  return request('/site');
}

export async function addRequest(payload) {
  const result = await request('/request', { method: 'POST', body: payload });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function loginAdmin(credentials) {
  return request('/admin/login', { method: 'POST', body: credentials });
}

export async function fetchAdminProfile(token) {
  return request('/admin/me', { token });
}

export async function getStats(token) {
  return request('/admin/stats', { token });
}

export async function getAdminRequests(token) {
  const result = await request('/admin/requests', { token });
  return result.requests;
}

export async function updateRequestStatus(id, status, token) {
  return request(`/admin/requests/${id}/status`, { method: 'POST', body: { status }, token });
}

export async function updateRequestNote(id, note, token) {
  return request(`/admin/requests/${id}/note`, { method: 'PATCH', body: { note }, token });
}

export async function addNews(payload, token) {
  const result = await request('/admin/news', { method: 'POST', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function updateNews(id, payload, token) {
  const result = await request(`/admin/news/${id}`, { method: 'PUT', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function deleteNews(id, token) {
  const result = await request(`/admin/news/${id}`, { method: 'DELETE', token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function addGalleryPhoto(payload, token) {
  const result = await request('/admin/gallery', { method: 'POST', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function updateGalleryPhoto(id, payload, token) {
  const result = await request(`/admin/gallery/${id}`, { method: 'PUT', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function deleteGalleryPhoto(id, token) {
  const result = await request(`/admin/gallery/${id}`, { method: 'DELETE', token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function setLogo(payload, token) {
  const result = await request('/admin/logo', { method: 'POST', body: { logo: payload }, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function getAdmins(token) {
  const result = await request('/admin/admins', { token });
  return result.admins;
}

export async function createAdmin(payload, token) {
  return request('/admin/admins', { method: 'POST', body: payload, token });
}

export async function deleteAdmin(id, token) {
  return request(`/admin/admins/${id}`, { method: 'DELETE', token });
}

export async function submitServiceRequest(payload) {
  return request('/service-request', { method: 'POST', body: payload });
}

export async function getServiceRequests(token) {
  const result = await request('/admin/service-requests', { token });
  return result.serviceRequests;
}

export async function updateServiceRequestStatus(id, status, token) {
  return request(`/admin/service-requests/${id}/status`, { method: 'POST', body: { status }, token });
}

export async function updateServiceRequestNote(id, note, token) {
  return request(`/admin/service-requests/${id}/note`, { method: 'PATCH', body: { note }, token });
}

export async function addService(payload, token) {
  const result = await request('/admin/services', { method: 'POST', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function updateService(id, payload, token) {
  const result = await request(`/admin/services/${id}`, { method: 'PUT', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function importServices(items, token) {
  const result = await request('/admin/services/import', { method: 'POST', body: { items }, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function deleteService(id, token) {
  const result = await request(`/admin/services/${id}`, { method: 'DELETE', token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function updateSiteContent(payload, token) {
  const result = await request('/admin/site-content', { method: 'PUT', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function updateSections(payload, token) {
  const result = await request('/admin/sections', { method: 'PUT', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export async function uploadFile(file, token) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Помилка завантаження файлу');
  return data.url;
}

/* ── Tariffs ── */
export async function addTariff(payload, token) {
  const result = await request('/admin/tariffs', { method: 'POST', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}
export async function updateTariff(id, payload, token) {
  const result = await request(`/admin/tariffs/${id}`, { method: 'PUT', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}
export async function deleteTariff(id, token) {
  const result = await request(`/admin/tariffs/${id}`, { method: 'DELETE', token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

/* ── Emergency Contacts ── */
export async function addEmergencyContact(payload, token) {
  const result = await request('/admin/emergency-contacts', { method: 'POST', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}
export async function updateEmergencyContact(id, payload, token) {
  const result = await request(`/admin/emergency-contacts/${id}`, { method: 'PUT', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}
export async function deleteEmergencyContact(id, token) {
  const result = await request(`/admin/emergency-contacts/${id}`, { method: 'DELETE', token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

/* ── Documents ── */
export async function uploadDocument(file, name, token) {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  const response = await fetch('/api/admin/documents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Помилка завантаження документу');
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return data.doc;
}
export async function deleteDocument(id, token) {
  const result = await request(`/admin/documents/${id}`, { method: 'DELETE', token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

/* ── Buildings & tariffs ── */
export async function getBuildings() {
  const result = await request('/buildings');
  return result.buildings;
}
export async function addBuilding(payload, token) {
  const result = await request('/admin/buildings', { method: 'POST', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result.building;
}
export async function updateBuilding(id, payload, token) {
  const result = await request(`/admin/buildings/${id}`, { method: 'PUT', body: payload, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result.building;
}
export async function deleteBuilding(id, token) {
  const result = await request(`/admin/buildings/${id}`, { method: 'DELETE', token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}
export async function importBuildings(items, token) {
  const result = await request('/admin/buildings/import', { method: 'POST', body: { items }, token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

/* ── Звіти будинків ── */
async function sendForm(path, formData, token) {
  const response = await fetch(`/api${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
  let data = null;
  try { data = await response.json(); } catch { /* nginx віддає HTML на завеликі файли */ }
  if (!response.ok) {
    if (response.status === 413) throw new Error('Файл завеликий для сервера (понад 15 МБ)');
    throw new Error(data?.error || `Помилка завантаження (${response.status})`);
  }
  return data;
}

export async function uploadBuildingReport(id, file, year, token) {
  const fd = new FormData();
  fd.append('year', String(year));
  fd.append('file', file);
  const result = await sendForm(`/admin/buildings/${id}/reports`, fd, token);
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

// Один файл за запит — щоб не впертися в ліміт розміру запиту на сервері
export async function bulkUploadReport(file, year, token) {
  const fd = new FormData();
  fd.append('year', String(year));
  fd.append('files', file);
  return sendForm('/admin/buildings/reports/bulk', fd, token);
}

export async function deleteBuildingReport(id, reportId, token) {
  const result = await request(`/admin/buildings/${id}/reports/${reportId}`, { method: 'DELETE', token });
  window.dispatchEvent(new Event('zhkp-data-updated'));
  return result;
}

export { getToken, saveToken, clearToken };
