import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="lj-dashboard-sidebar">
      <div className="lj-dashboard-brand">
        <span className="lj-brand-text">
          <span className="lj-brand-outline">Lapor</span>
          <span className="lj-brand-strong">Jalan</span>
        </span>
      </div>

      <div className="lj-dashboard-section">
        <div className="lj-dashboard-section-title">
          <span className="lj-dashboard-section-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <ellipse cx="12" cy="6" rx="8" ry="3" />
              <path d="M4 6v4c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
              <path d="M4 10v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4" />
            </svg>
          </span>
          <span>MASTER DATA</span>
        </div>

        <nav className="lj-dashboard-nav">
          <a className="lj-dashboard-link is-active" href="/dashboard">
            <span className="lj-dashboard-link-icon" aria-hidden="true">
              <img src="/images/navDashboard.png" alt="" />
            </span>
            <span className="lj-dashboard-link-text">Dashboard</span>
          </a>
          <a className="lj-dashboard-link" href="/dashboard/user">
            <span className="lj-dashboard-link-icon" aria-hidden="true">
              <img src="/images/navUser.png" alt="" />
            </span>
            <span className="lj-dashboard-link-text">User</span>
          </a>
          <a className="lj-dashboard-link" href="/dashboard/data-jalan">
            <span className="lj-dashboard-link-icon" aria-hidden="true">
              <img src="/images/navRoad.png" alt="" />
            </span>
            <span className="lj-dashboard-link-text">Data Jalan</span>
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
