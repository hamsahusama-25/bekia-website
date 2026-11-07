'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PrivateImage({ name, label }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let objectUrl;

    api.getBlob(`/files/${name}`)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => setError('تعذر تحميل الصورة'));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [name]);

  if (error) {
    return <span className="text-xs text-alert">{error}</span>;
  }

  if (!url) {
    return <span className="text-xs text-slate-500">...</span>;
  }

  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={label}
        className="h-28 w-28 rounded-lg border object-cover"
      />

      <figcaption className="text-center text-xs text-slate-600">
        {label}
      </figcaption>
    </figure>
  );
}