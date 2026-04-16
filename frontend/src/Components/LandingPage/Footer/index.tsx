import '../../../assets/style.css'

const footerLinks = [
  { label: 'Tentang Sistem', href: '#tentang' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Peta Interaktif', href: '#peta' },
]

const socialLinks = [
  { label: 'Instagram', href: '#', icon: '/images/ig.png' },
  { label: 'Facebook', href: '#', icon: '/images/fb.png' },
  { label: 'X', href: '#', icon: '/images/x.png' },
  { label: 'YouTube', href: '#', icon: '/images/yt.png' },
]

const Footer = () => {
  return (
    <footer className="lj-footer">
      <div className="lj-container lj-footer-shell">
        <div className="lj-footer-inner">
          <div className="lj-footer-brand">
            <div className="lj-footer-kicker">LaporJalan</div>
            <h3>Pelaporan jalan rusak yang lebih jelas dan terarah.</h3>
            <p>
              Platform pelaporan kerusakan jalan berbasis peta untuk membantu
              masyarakat menyampaikan informasi secara cepat, jelas, dan mudah
              dipantau.
            </p>
          </div>

          <div className="lj-footer-links">
            <h4>Tautan Cepat</h4>
            <ul>
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lj-footer-social">
            <h4>Ikuti Kami</h4>
            <p className="lj-footer-social-text">
              Pantau informasi dan pembaruan terbaru melalui kanal sosial kami.
            </p>
            <div className="lj-footer-icons">
              {socialLinks.map((item) => (
                <a key={item.label} href={item.href} aria-label={item.label} title={item.label}>
                  <img src={item.icon} alt={item.label} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="lj-footer-bottom">
          <p>© 2026 LaporJalan. Semua hak dilindungi.</p>
          <a href="#beranda">Kembali ke atas</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
