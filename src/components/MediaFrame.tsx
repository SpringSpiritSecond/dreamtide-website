import { ImageIcon, VideoIcon } from 'lucide-react';
import { useState } from 'react';

export type MediaFrameProps = { src: string; alt: string; label: string; eager?: boolean; portrait?: boolean; poster?: string; onImageClick?: () => void; };

export function MediaFrame({ src, alt, label, eager = false, portrait = false, poster, onImageClick }: MediaFrameProps) {
  const [failed, setFailed] = useState(false);
  const url = `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;
  const isVideo = /\.mp4(?:$|[?#])/i.test(src);
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const FallbackIcon = isVideo ? VideoIcon : ImageIcon;
  return (
    <figure className={`media-frame${portrait ? ' media-frame--portrait' : ''}`} data-state={failed ? 'missing' : 'ready'}
      style={isVideo && poster ? { backgroundImage: `url("${import.meta.env.BASE_URL}${poster}")`, backgroundPosition: 'center', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' } : undefined}>
      {!failed && isVideo && <video src={url} poster={poster ? `${import.meta.env.BASE_URL}${poster}` : undefined} aria-label={alt} autoPlay={!reduceMotion} controls
        muted loop playsInline preload="metadata" onError={() => setFailed(true)} />}
      {!failed && !isVideo && (onImageClick ? <button type="button" className="media-frame__open"
        aria-label={`展开${label}图文说明`} onClick={onImageClick}>
        <img src={url} alt={alt} loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'} onError={() => setFailed(true)} />
      </button> : <img src={url} alt={alt} loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'} onError={() => setFailed(true)} />)}
      {failed && <figcaption className="media-frame__fallback"><FallbackIcon aria-hidden="true" size={24} strokeWidth={1.5} />
        <strong>{label}</strong><span>暂时无法显示此画面</span></figcaption>}
    </figure>
  );
}
