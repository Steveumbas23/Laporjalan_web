const heroLines = [
  'Sistem Informasi Geografis',
  'untuk Prioritas Penanganan',
  'Kerusakan Jalan',
]

const Hero = () => {
  return (
    <section className="lj-hero" id="beranda">
      <div className="lj-container lj-hero-inner">
        <div className="lj-hero-text">
          <div className="lj-hero-kicker">SIG Prioritas Penanganan Jalan</div>
          <h1>
            {heroLines.map((line, index) => (
              <span
                key={line}
                className="lj-hero-line"
                style={{ animationDelay: `${0.16 + index * 0.1}s` }}
              >
                {line}
              </span>
            ))}
          </h1>
          <p>
            Platform untuk melaporkan jalan rusak dengan cepat, lengkap dengan foto
            dan lokasi agar penanganan bisa segera dilakukan
          </p>
          <div className="lj-hero-actions">
            <a className="lj-hero-btn" href="#peta">
              <span className="lj-hero-btn-label">
                <span className="lj-hero-btn-text">Lihat Peta Jalan</span>
              </span>
              <span className="lj-hero-btn-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
