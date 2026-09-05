import { ChevronLeft, ChevronRight, Home, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

export type ShellPage = 'home' | 'settings';

interface AppShellProps {
  activePage: ShellPage;
  collapsed: boolean;
  children: ReactNode;
  onNavigate: (page: ShellPage) => void;
  onToggle: () => void;
}

export function AppShell({ activePage, collapsed, children, onNavigate, onToggle }: AppShellProps) {
  return (
    <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`}>
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span>AHTR</span>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
        <nav className="app-nav" aria-label="Main navigation">
          <button
            className={activePage === 'home' ? 'is-active' : ''}
            type="button"
            onClick={() => onNavigate('home')}
          >
            <Home aria-hidden="true" size={17} />
            <span>Home</span>
          </button>
          <button
            className={activePage === 'settings' ? 'is-active' : ''}
            type="button"
            onClick={() => onNavigate('settings')}
          >
            <Settings aria-hidden="true" size={17} />
            <span>Settings</span>
          </button>
        </nav>
        <p className="sidebar-note">Settings are kept on this device.</p>
      </aside>
      <div className="shell-content">{children}</div>
    </div>
  );
}
