import '../../../assets/style.css'

const aboutCards = [
  {
    title: 'Pelaporan Mudah',
    description:
      'Masyarakat dapat melaporkan kerusakan jalan secara cepat dengan informasi lokasi yang jelas dan alur yang sederhana.',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M18 14h20l8 8v28a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M38 14v10h10M24 34h16M24 42h16"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Pemetaan Prioritas',
    description:
      'Setiap laporan ditampilkan pada peta agar titik kerusakan bisa dipantau dan diprioritaskan untuk penanganan.',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 56s16-14.18 16-28a16 16 0 1 0-32 0c0 13.82 16 28 16 28Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle
          cx="32"
          cy="28"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
      </svg>
    ),
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
            <article key={card.title} className="lj-about-card">
              <div className="lj-about-icon">{card.icon}</div>
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
