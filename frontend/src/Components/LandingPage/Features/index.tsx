import '../../../assets/style.css'

const features = [
  {
    eyebrow: 'Presisi Lokasi',
    title: 'Pelaporan Lokasi Secara Akurat',
    description:
      'Pengguna dapat menandai titik kerusakan jalan secara langsung pada peta agar lokasi laporan lebih presisi dan mudah diverifikasi.',
    stat: 'GPS & peta interaktif',
  },
  {
    eyebrow: 'Bukti Visual',
    title: 'Unggah Foto Kondisi Jalan',
    description:
      'Setiap laporan dapat dilengkapi dokumentasi visual untuk membantu proses identifikasi tingkat kerusakan di lapangan.',
    stat: 'Dokumentasi lebih lengkap',
  },
  {
    eyebrow: 'Transparansi Status',
    title: 'Pemantauan Status Laporan',
    description:
      'Masyarakat bisa melihat perkembangan laporan yang telah dikirim, mulai dari proses peninjauan hingga penanganan selesai.',
    stat: 'Progres mudah dipantau',
  },
]

const Features = () => {
  return (
    <section className="lj-fiture" id="fitur">
      <div className="lj-container lj-fiture-inner">
        <div className="lj-fiture-image">
          <img src="/images/imageForFitur.png" alt="Ilustrasi fitur LaporJalan" />
        </div>

        <div className="lj-fiture-content">
          <div className="lj-fiture-kicker">Fitur Utama</div>
          <h2>Fitur unggulan yang membuat pelaporan lebih cepat dan terstruktur.</h2>
          <p className="lj-fiture-intro">
            Setiap alur dirancang agar masyarakat bisa mengirim laporan dengan jelas,
            sementara pihak terkait mendapatkan konteks yang cukup untuk menindaklanjuti.
          </p>
          <div className="lj-fiture-summary">
            <div className="lj-fiture-summary-value">3</div>
            <div className="lj-fiture-summary-copy">
              <strong>Alur inti pelaporan</strong>
              <span>Dibuat ringkas agar cepat dipahami dan mudah dipakai.</span>
            </div>
          </div>
          <ul className="lj-fiture-list">
            {features.map((feature) => (
              <li key={feature.title}>
                <span className="lj-fiture-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.14" />
                    <path
                      d="M7.5 12.5 10.5 15.5 16.5 9.5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="lj-fiture-card">
                  <span className="lj-fiture-eyebrow">{feature.eyebrow}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="lj-fiture-stat">{feature.stat}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Features
