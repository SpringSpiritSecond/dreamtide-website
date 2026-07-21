import { ImageIcon } from 'lucide-react';
import { useState } from 'react';

export type MediaFrameProps = {
  src: string;
  alt: string;
  label: string;
  eager?: boolean;
  portrait?: boolean;
};

export function MediaFrame({
  src,
  alt,
  label,
  eager = false,
  portrait = false,
}: MediaFrameProps) {
  const [failed, setFailed] = useState(false);
  const url = `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;

  return (
    <figure
      className={`media-frame${portrait ? ' media-frame--portrait' : ''}`}
      data-state={failed ? 'missing' : 'ready'}
    >
      {!failed && (
        <img
          src={url}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <figcaption className="media-frame__fallback">
          <ImageIcon aria-hidden="true" size={24} strokeWidth={1.5} />
          <strong>{label}</strong>
          <span>截图 / GIF 待替换</span>
        </figcaption>
      )}
    </figure>
  );
}
