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
          <a className="lj-hero-btn" href="/map">
            Pelajari Lebih Lanjut
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
