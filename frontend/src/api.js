// Live site par VITE_API_URL se backend ka address milta hai, apne computer pe localhost
export const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const MESSAGES = {
  'Pehle login karo': 'Please log in first.',
  'Token galat ya expire ho gaya': 'Your session has expired. Please log in again.',
  'Is kaam ki ijazat nahi': 'You do not have permission to do this.',
  'Sab zaroori fields bharo': 'Please fill in all required fields.',
  'business_type gym, salon ya clinic hona chahiye': 'Please choose a valid business type.',
  'Mobile 10+ digit aur password 6+ character ka ho':
    'Mobile number must have at least 10 digits and the password at least 6 characters.',
  'Ye mobile number pehle se registered hai': 'This mobile number is already registered.',
  'Naam, mobile aur password zaroori hain': 'Name, mobile number and password are required.',
  'Mobile aur password do': 'Please enter your mobile number and password.',
  'Mobile ya password galat hai': 'Incorrect mobile number or password.',
  'Business nahi mila': 'Business not found.',
  'staff_id, service_id aur date do': 'Please select a service, a specialist and a date.',
  'staff_id, service_id, date aur time do': 'Please select a service, a specialist, a date and a time.',
  'Ye slot ab khaali nahi hai': 'This time slot is no longer available.',
  'Test payment band hai': 'Payments are currently disabled.',
  'Booking nahi mili ya 15 minute guzar gaye, dobara booking karo':
    'Booking not found or the 15-minute payment window has expired. Please book again.',
  'QR nahi mila': 'QR code not found.',
  'date YYYY-MM-DD format mein do': 'Invalid date.',
  'Staff nahi mila': 'Specialist not found.',
  'Ye staff ye service nahi deta': 'This specialist does not offer this service.',
  'QR token do': 'No QR code was provided.',
  'QR nahi mila ya is business ka nahi hai': 'QR code not found or it belongs to another business.',
  'Ye QR pehle hi use ho chuka hai': 'This QR code has already been used.',
  'Booking cancel ho chuki hai': 'This booking has been cancelled.',
  'Payment nahi hui': 'Payment has not been completed.',
};

// backend ka Roman Urdu message screen pe English mein dikhao
export function tr(msg) {
  if (!msg) return 'Something went wrong. Please try again.';
  if (MESSAGES[msg]) return MESSAGES[msg];
  if (msg.startsWith('Ye aaj ki booking nahi hai')) {
    const m = msg.match(/booking: (.+)\)/);
    return m ? `This booking is not for today (${m[1]}).` : 'This booking is not for today.';
  }
  return msg;
}

export async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(tr(data.error));
  return data;
}