const aboutCards = [
  {
    title: 'Pelaporan Mudah',
    description:
      'Masyarakat dapat melaporkan kerusakan jalan secara cepat dengan informasi lokasi yang jelas dan alur yang sederhana.',
    icon: '/images/iconRoad.png',
    alt: 'Ikon jalan',
  },
  {
    title: 'Pemetaan Prioritas',
    description:
      'Setiap laporan ditampilkan pada peta agar titik kerusakan bisa dipantau dan diprioritaskan untuk penanganan.',
    icon: '/images/iconMAP.png',
    alt: 'Ikon peta',
  },
]

const About = () => {
  return (
    <section className="lj-about" id="tentang">
      <div className="lj-container lj-about-inner">
        <div className="lj-about-header">
          <h2>Tentang LaporJalan</h2>
          <p>
            LaporJalan membantu masyarakat menyampaikan laporan kerusakan jalan
            dengan lebih terstruktur agar proses pemantauan dan tindak lanjut
            bisa dilakukan lebih cepat.
          </p>
        </div>

        <div className="lj-about-cards">
          {aboutCards.map((card) => (
            <article key={card.title} className="lj-about-card" tabIndex={0}>
              <div className="lj-about-icon">
                <img src={card.icon} alt={card.alt} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
