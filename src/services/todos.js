import request from '@/utils/request';

export async function queryEventlist(status) {
  return request(`/api/eventList?status=${status}`);
}

export async function deleteEvent(params) {
  return request('/api/deleteEvent', {
    method: 'POST',
    data:params,
  });
}

export async function addEvent(params) {
  return request('/api/addEvent', {
    method: 'POST',
    data:params,
  });
}

export async function updateEvent(params) {
  return request('/api/updateEvent', {
    method: 'POST',
    data:params,
  });
}

export async function clearCompleted() {
  return request('/api/clearCompleted', {
    method: 'POST',
  });
}

export async function changeDoneStatus(params) {
  return request('/api/changeDoneStatus', {
    method: 'POST',
    data:params,
  });
}

