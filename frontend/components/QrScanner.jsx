'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Camera QR scanner built on the browser's BarcodeDetector API (Chrome/Edge on Android and desktop).
 * Where the API is missing the collector types the code instead, so the flow never depends on it.
 */
export function qrScanSupported() {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia;
}

export default function QrScanner({ onResult, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream;
    let timer;
    let stopped = false;

    async function start() {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stopped) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        timer = setInterval(async () => {
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) onResult(codes[0].rawValue);
          } catch {
            /* a frame that cannot be decoded is simply skipped */
          }
        }, 400);
      } catch {
        setError('تعذر فتح الكاميرا. اكتب الكود يدويًا.');
      }
    }
    start();

    return () => {
      stopped = true;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  return (
    <div className="space-y-2">
      {error ? (
        <p role="alert" className="text-sm text-alert">{error}</p>
      ) : (
        <video ref={videoRef} muted playsInline className="w-full rounded-lg bg-black" aria-label="كاميرا مسح كود QR" />
      )}
      <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
        إغلاق الكاميرا
      </button>
    </div>
  );
}
