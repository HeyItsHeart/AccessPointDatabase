import { v4 as uuid } from "uuid";

const users = new Map();   // userId -> username
const sockets = new Map(); // ws -> userId

export function createUser(username) {
  const id = uuid();
  users.set(id, username);
  return { id, username };
}

export function attachSocket(ws, userId) {
  sockets.set(ws, userId);
}

export function removeSocket(ws) {
  sockets.delete(ws);
}

export function getUsername(ws) {
  const id = sockets.get(ws);
  return users.get(id);
}

export function getAllUsers() {
  return [...users.values()];
}
