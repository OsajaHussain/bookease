import { useRef, useState } from 'react';
import '../requests.css';
import { Icon } from './Icons.jsx';

const MAX_CHARS = 850000;

const HINTS = {
  salon: {
    title: 'Style reference',
    placeholder: 'Describe the look you want (cut, colour, length). You can attach a reference photo.',
  },
  clinic: {
    title: 'Your concern',
    placeholder: 'Briefly describe your problem or symptoms. You can attach a photo if it helps.',
  },
  gym: {
    title: 'Your goals',
    placeholder: 'Tell us your goal or the equipment you want to use. You can attach a photo.',
  },
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This file could not be read as an image. Please try a JPG or PNG.'));
    img.src = url;
  });
}

function toJpeg(img, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

// photo ko chhota karke JPEG bana do, taake upload tez ho
async function prepareImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > 20 * 1024 * 1024) throw new Error('This image is too large. Please choose one under 20 MB.');

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    for (const [side, q] of [[1280, 0.8], [1024, 0.7], [800, 0.6], [640, 0.5]]) {
      const out = toJpeg(img, side, q);
      if (out.length <= MAX_CHARS) return out;
    }
    throw new Error('This image is too large. Please choose a smaller one.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function RequestField({ type, value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const hint = HINTS[type] || HINTS.salon;

  async function pick(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const image = await prepareImage(file);
      onChange({ ...value, image });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="req-box">
      <h4>Add details (optional)</h4>
      <div className="muted" style={{ fontSize: 14 }}>
        {hint.title}: only this business can see what you share.
      </div>

      <textarea
        className="input"
        style={{ marginTop: 12 }}
        maxLength={1000}
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder={hint.placeholder}
      />
      <div className="hint" style={{ textAlign: 'right' }}>{value.description.length}/1000</div>

      {!value.image ? (
        <label className="upload-drop">
          <span className="upload-icon"><Icon name="image" size={20} /></span>
          <span>
            <b>{busy ? 'Preparing photo...' : 'Add a photo'}</b>
            <small>JPG or PNG. It is resized automatically.</small>
          </span>
          <input ref={inputRef} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
        </label>
      ) : (
        <div className="upload-preview">
          <img src={value.image} alt="Your attached photo" />
          <button type="button" className="upload-remove" onClick={() => onChange({ ...value, image: '' })}>
            Remove
          </button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}