const NotFound = () => {
  return (
    <main className="lj-error-page lj-error-page--notfound">
      <div className="lj-error-card">
        <div className="lj-error-code">404</div>
        <h1 className="lj-error-title">Halaman tidak ditemukan</h1>
        <p className="lj-error-text">
          URL yang Anda buka tidak tersedia atau sudah dipindahkan. Periksa kembali alamat
          halaman yang dimasukkan.
        </p>
        <div className="lj-error-actions">
          <a className="lj-error-btn lj-error-btn--primary" href="/">
            Kembali ke Beranda
          </a>
          <a className="lj-error-btn lj-error-btn--ghost" href="/signin">
            Masuk User
          </a>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
