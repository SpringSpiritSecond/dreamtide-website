import { Menu, X } from 'lucide-react';
import { useState } from 'react';

type Route = 'home' | 'app' | 'features' | 'guide' | 'download';

const links = [
  { href: '#/', route: 'home' as const, label: '首页' },
  { href: '#/features', route: 'features' as const, label: '功能' },
  { href: '#/guide', route: 'guide' as const, label: '使用指南' },
];

export function Header({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="#/" aria-label="梦潮首页"><span>梦潮</span><small>DreamTide</small></a>
      <button className="menu-button" type="button" aria-expanded={open}
        aria-controls="site-navigation" aria-label={open ? '关闭导航' : '打开导航'}
        onClick={() => setOpen((value) => !value)}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav id="site-navigation" className={open ? 'site-nav is-open' : 'site-nav'}>
        {links.map((link) => (
          <a key={link.href} href={link.href} aria-current={route === link.route ? 'page' : undefined}
            onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a className="nav-download" href="#/download" aria-current={route === 'download' ? 'page' : undefined} onClick={() => setOpen(false)}>下载</a>
      </nav>
    </header>
  );
}
