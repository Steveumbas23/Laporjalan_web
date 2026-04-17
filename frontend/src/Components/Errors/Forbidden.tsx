import { readStoredUser } from '../../lib/auth';

const Forbidden = () => {
  const user = readStoredUser();
  const isAdmin = user?.role === 'admin';

  return (
    <main className="lj-error-page lj-error-page--forbidden">
      <div className="lj-error-card">
        <div className="lj-error-code">403</div>
        <h1 className="lj-error-title">Akses ditolak</h1>
        <p className="lj-error-text">
          Halaman ini hanya bisa dibuka oleh admin. Anda tidak memiliki izin untuk mengakses
          resource ini.
        </p>
        <div className="lj-error-actions">
          <a className="lj-error-btn lj-error-btn--primary" href={isAdmin ? '/dashboard' : '/'}>
            {isAdmin ? 'Buka Dashboard' : 'Kembali ke Beranda'}
          </a>
          {!isAdmin ? (
            <a className="lj-error-btn lj-error-btn--ghost" href="/admin/signin">
              Masuk Admin
            </a>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default Forbidden;
