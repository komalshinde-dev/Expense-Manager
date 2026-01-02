import API from './axios';

// Create SIP
export const createSIP = async (data) => {
  const res = await API.post('/sips', data);
  return res.data;
};

// Get all SIPs
export const getSIPs = async () => {
  const res = await API.get('/sips');
  return res.data;
};

// Update SIP
export const updateSIP = async (id, data) => {
  const res = await API.put(`/sips/${id}`, data);
  return res.data;
};

// Delete SIP
export const deleteSIP = async (id) => {
  const res = await API.delete(`/sips/${id}`);
  return res.data;
};
