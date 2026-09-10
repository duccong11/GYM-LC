const resources: Record<string, string> = {
  member: 'members',
  plan: 'plans',
  payment: 'payments',
  checkin: 'checkins',
  trainer: 'trainers',
  user: 'users',
  room: 'rooms',
  equipment: 'equipment',
};
export function mutateRequest(payload: Record<string, unknown>, csrf: string) {
  const [kind, op] = String(payload.action).split('.');
  const collection = resources[kind];
  let path = '/api/gym',
    method = 'POST';
  if (collection) {
    path = '/api/' + collection;
    if (op === 'save' && payload.id) {
      path += '/' + encodeURIComponent(String(payload.id));
      method = 'PUT';
    } else if (op === 'delete') {
      path += '/' + encodeURIComponent(String(payload.id));
      method = 'DELETE';
    } else if (op === 'archive' || op === 'toggle') {
      path += '/' + encodeURIComponent(String(payload.id)) + '/' + op;
      method = 'PATCH';
    } else if (op === 'checkout') {
      path += '/checkout';
    }
  }
  return fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(payload),
  });
}
