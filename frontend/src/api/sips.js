import API from './axios'; // use the axios instance with interceptor

// Create new SIP
export const createSIP = async (sipData) => {
  const response = await API.post('/sips', sipData);
  return response.data;
};

// Get all SIPs
export const getSIPs = async (activeOnly = true) => {
  const response = await API.get('/sips', {
    params: { active: activeOnly },
  });
  return response.data;
};

// Get single SIP with detailed analysis
export const getSIP = async (id) => {
  const response = await API.get(`/sips/${id}`);
  return response.data;
};

// Update SIP
export const updateSIP = async (id, sipData) => {
  const response = await API.put(`/sips/${id}`, sipData);
  return response.data;
};

// Delete SIP
export const deleteSIP = async (id) => {
  const response = await API.delete(`/sips/${id}`);
  return response.data;
};

// Search for fund symbols
export const searchFunds = async (query) => {
  const response = await API.get('/sips/search-funds', {
    params: { query },
  });
  return response.data;
};

// Refresh SIP valuation
export const refreshSIP = async (id) => {
  const response = await API.post(`/sips/${id}/refresh`);
  return response.data;
};
