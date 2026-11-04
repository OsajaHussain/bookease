import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Ticket({ a, token }) {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    api(`/customer/appointments/${a.id}/qr`, { token }).then(setQr).catch(() => {});
  }, [a.id, a.qr_status, token]);

  const used = a.qr_status === 'used';
  const [date, time] = String(a.start_time).split(' ');

  return (
    <div className={used ? 'ticket used' : 'ticket'}>
      <div className="ticket-info">
        <div className="ticket-top">Appointment ticket</div>
        <h3 style={{ margin: '10px 0 2px', fontSize: 24, color: '#fff' }}>{a.service}</h3>
        <div style={{ color: '#94a3b8', marginBottom: 14 }}>{a.business}</div>

        <div className="ticket-row"><span>Specialist</span><b>{a.staff}</b></div>
        <div className="ticket-row"><span>Date</span><b>{date}</b></div>
        <div className="ticket-row"><span>Time</span><b>{time}</b></div>
        <div className="ticket-row"><span>Amount</span><b>Rs {Number(a.amount).toLocaleString()}</b></div>

        <div className={used ? 'pill used' : 'pill ok'}>
          {used ? 'Already used' : 'Valid, ready to scan'}
        </div>
      </div>

      <div className="ticket-qr">
        {qr ? (
          <>
            <img src={qr.image} alt="QR code" />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Show this QR code at entry</div>
          </>
        ) : (
          <div style={{ color: '#64748b' }}>Loading QR code...</div>
        )}
        {used && <div className="stamp">USED</div>}
      </div>
    </div>
  );
}