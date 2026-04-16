import '../../../assets/style.css'

const heroLines = [
  'Sistem Informasi',
  'Geografis Prioritas',
  'Untuk Penanganan',
  'Kerusakan Jalan',
]

const Hero = () => {
  return (
    <section className="lj-hero" id="beranda">
      <div className="lj-container lj-hero-inner">
        <div className="lj-hero-text">
          <div className="lj-hero-kicker">SIG Prioritas Penanganan Jalan</div>
          <h1>
            {heroLines.map((line) => (
              <span key={line} className="lj-hero-line">
                {line}
              </span>
            ))}
          </h1>
          <p>
            Platform untuk melaporkan jalan rusak dengan mudah, lengkap dengan foto
            dan lokasi, agar dapat segera ditindaklanjuti.
          </p>
          <div className="lj-hero-actions">
            <a className="lj-hero-btn" href="#peta">
              <span className="lj-hero-btn-label">
                <span className="lj-hero-btn-text">Pelajari Lebih Lanjut</span>
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
