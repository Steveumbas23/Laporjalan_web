const features = [
  {
    title: 'Pelaporan Lokasi Secara Akurat',
    description:
      'Pengguna dapat menandai titik kerusakan jalan secara langsung pada peta agar lokasi laporan lebih presisi dan mudah diverifikasi.',
  },
  {
    title: 'Unggah Foto Kondisi Jalan',
    description:
      'Setiap laporan dapat dilengkapi dokumentasi visual untuk membantu proses identifikasi tingkat kerusakan di lapangan.',
  },
  {
    title: 'Pemantauan Status Laporan',
    description:
      'Masyarakat bisa melihat perkembangan laporan yang telah dikirim, mulai dari proses peninjauan hingga penanganan selesai.',
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
          <h2>Fitur Unggulan LaporJalan</h2>
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
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
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
