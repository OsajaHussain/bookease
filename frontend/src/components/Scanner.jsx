import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api, tr } from '../api.js';
import { unlockAudio, playBeep, playApproved, playRejected } from '../sound.js';
import { Icon } from './Icons.jsx';

function Check({ ok }) {
  return (
    <svg width="88" height="88" viewBox="0 0 52 52" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <circle className="check-circle" cx="26" cy="26" r="24" stroke={ok ? '#16a34a' : '#dc2626'} />
      {ok ? (
        <path className="check-mark" d="M14 27l8 8 16-17" stroke="#16a34a" />
      ) : (
        <path className="cross" d="M18 18l16 16M34 18L18 34" stroke="#dc2626" />
      )}
    </svg>
  );
}

export default function Scanner({ token, onDone }) {
  const scannerRef = useRef(null);
  const lockRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [flashKey, setFlashKey] = useState(0);

  async function stopCamera() {
    const s = scannerRef.current;
    if (s) {
      try {
        if (s.isScanning) await s.stop();
        s.clear();
      } catch {}
      scannerRef.current = null;
    }
    setRunning(false);
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function show(r) {
    setResult(r);
    setFlashKey((k) => k + 1);
    if (r.approved) {
      playApproved();
      if (navigator.vibrate) navigator.vibrate([120, 60, 120, 60, 260]);
    } else {
      playRejected();
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
    }
  }

  async function check(qrText) {
    try {
      const r = await api('/staff/scan', { method: 'POST', token, body: { token: qrText } });
      show(r.approved ? r : { approved: false, reason: tr(r.reason) });
      onDone && onDone();
    } catch (e) {
      show({ approved: false, reason: e.message });
    }
  }

  async function startCamera() {
    unlockAudio();
    setResult(null);
    setError('');
    lockRef.current = false;
    try {
      const s = new Html5Qrcode('qr-reader');
      scannerRef.current = s;
      await s.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (text) => {
          if (lockRef.current) return;
          lockRef.current = true;
          playBeep();
          await stopCamera();
          await check(text);
        },
        () => {}
      );
      setRunning(true);
    } catch {
      scannerRef.current = null;
      setError('Could not open the camera. Please allow camera access in your browser (camera icon near the address bar).');
    }
  }

  async function scanImage(e) {
    unlockAudio();
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setResult(null);
    setError('');
    try {
      const s = new Html5Qrcode('qr-reader');
      const text = await s.scanFile(file, false);
      s.clear();
      playBeep();
      await check(text);
    } catch {
      setError('No QR code found in this image. Please try a clearer picture.');
    }
  }

  function again() {
    setResult(null);
    startCamera();
  }

  return (
    <div className="card">
      {result && <div key={flashKey} className={result.approved ? 'flash ok' : 'flash bad'} />}

      <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="camera" size={20} /> QR scanner
      </h3>

      <div className="scanner-box" style={{ display: running ? 'block' : 'none' }}>
        <div id="qr-reader" />
      </div>
      {!running && <div id="qr-reader" style={{ display: 'none' }} />}

      {result && (
        <div key={flashKey} className={result.approved ? 'result ok' : 'result bad'}>
          <Check ok={result.approved} />
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
            {result.approved ? 'APPROVED' : 'NOT APPROVED'}
          </div>
          {result.approved ? (
            <div style={{ marginTop: 10, lineHeight: 1.7 }}>
              <b style={{ fontSize: 20 }}>{result.customer}</b>
              <br />
              {result.service} • {result.staff}
              <br />
              {result.time}
            </div>
          ) : (
            <div style={{ marginTop: 10, fontSize: 17 }}>{result.reason}</div>
          )}
          <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={again}>
            Scan next
          </button>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {!result && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          {!running ? (
            <button className="btn btn-primary" onClick={startCamera}>
              <Icon name="camera" size={16} /> Start camera
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={stopCamera}>Stop camera</button>
          )}
          {!running && (
            <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
              <Icon name="image" size={16} /> Scan from image
              <input type="file" accept="image/*" onChange={scanImage} style={{ display: 'none' }} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}