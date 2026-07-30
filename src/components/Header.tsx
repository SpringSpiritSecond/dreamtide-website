import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '#features', label: '功能' },
  { href: '#guide', label: '使用方法' },
  { href: '#privacy', label: '隐私' },
  { href: '#faq', label: '问答' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="梦潮首页">
        <span>梦潮</span><small>Dreamtide</small>
      </a>
      <button className="menu-button" type="button" aria-expanded={open}
        aria-controls="site-navigation" aria-label={open ? '关闭导航' : '打开导航'}
        onClick={() => setOpen((value) => !value)}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav id="site-navigation" className={open ? 'site-nav is-open' : 'site-nav'}>
        {links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
        <a className="nav-download" href="#download" onClick={() => setOpen(false)}>下载</a>
      </nav>
    </header>
  );
}
