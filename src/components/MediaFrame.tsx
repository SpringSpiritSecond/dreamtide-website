import { ImageIcon, VideoIcon } from 'lucide-react';
import { useState } from 'react';

export type MediaFrameProps = { src: string; alt: string; label: string; eager?: boolean; portrait?: boolean; };

export function MediaFrame({ src, alt, label, eager = false, portrait = false }: MediaFrameProps) {
  const [failed, setFailed] = useState(false);
  const url = `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;
  const isVideo = /\.mp4(?:$|[?#])/i.test(src);
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const FallbackIcon = isVideo ? VideoIcon : ImageIcon;
  return (
    <figure className={`media-frame${portrait ? ' media-frame--portrait' : ''}`} data-state={failed ? 'missing' : 'ready'}>
      {!failed && isVideo && <video src={url} aria-label={alt} autoPlay={!reduceMotion} controls={reduceMotion}
        muted loop playsInline preload={eager ? 'metadata' : 'none'} onError={() => setFailed(true)} />}
      {!failed && !isVideo && <img src={url} alt={alt} loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'} onError={() => setFailed(true)} />}
      {failed && <figcaption className="media-frame__fallback"><FallbackIcon aria-hidden="true" size={24} strokeWidth={1.5} />
        <strong>{label}</strong><span>媒体素材待补充</span></figcaption>}
    </figure>
  );
}
