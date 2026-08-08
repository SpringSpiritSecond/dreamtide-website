import { Menu, X } from 'lucide-react';
import { useState } from 'react';

type Page = 'home' | 'app';

const links = [
  { href: '#/', page: 'home' as const, label: '首页' },
  { href: '#/app', page: 'app' as const, label: '走进梦潮' },
];

export function Header({ page }: { page: Page }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="#/" aria-label="梦潮首页"><span>梦潮</span><small>Dreamtide</small></a>
      <button className="menu-button" type="button" aria-expanded={open}
        aria-controls="site-navigation" aria-label={open ? '关闭导航' : '打开导航'}
        onClick={() => setOpen((value) => !value)}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav id="site-navigation" className={open ? 'site-nav is-open' : 'site-nav'}>
        {links.map((link) => (
          <a key={link.href} href={link.href} aria-current={page === link.page ? 'page' : undefined}
            onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a className="nav-download" href="#/app" onClick={() => setOpen(false)}>下载</a>
      </nav>
    </header>
  );
}
