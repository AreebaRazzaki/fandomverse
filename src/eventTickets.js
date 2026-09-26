import { useSyncExternalStore } from 'react';

const KEY = 'fandomverse-event-tickets';

let cache = null;
let listeners = [];

// Same contract as the bookmark store: storage is the single source of truth and
// the parsed array is only rebuilt when the raw string actually changes, so
// getSnapshot stays referentially stable for useSyncExternalStore.
const read = () => {
  let raw = '';
  try {
    raw = window.localStorage.getItem(KEY) || '';
  } catch {
    raw = '';
  }

  if (cache && cache.raw === raw) return cache.list;

  let list = [];
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    list = Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string') : [];
  } catch {
    list = [];
  }

  cache = { raw, list };
  return list;
};

const write = (next) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable, private mode, or quota: the UI still updates */
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.push(listener);
  return () => { listeners = listeners.filter((item) => item !== listener); };
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== KEY) return;
    cache = null;
    listeners.forEach((listener) => listener());
  });
}

export const getTickets = () => read();
export const isBooked = (id) => read().some((item) => item.id === id);

// Bookings are device local: no payment, no account, nothing leaves the browser.
export const bookTicket = (ticket) => {
  if (!ticket?.id || isBooked(ticket.id)) return;
  const seats = Math.max(1, Math.min(8, Number(ticket.seats) || 1));
  write([{ ...ticket, seats, at: new Date().toISOString() }, ...read()]);
};

export const setTicketSeats = (id, seats) => {
  const next = Math.max(1, Math.min(8, Number(seats) || 1));
  write(read().map((item) => (item.id === id ? { ...item, seats: next } : item)));
};

export const cancelTicket = (id) => write(read().filter((item) => item.id !== id));
export const clearTickets = () => write([]);

export const resyncTickets = () => {
  cache = null;
  listeners.forEach((listener) => listener());
};

export const useTickets = () => useSyncExternalStore(subscribe, read, read);
