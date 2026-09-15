import client from './client';

export const getMe = () => client.get('/users/me'); // -> { id, name, email, role }
