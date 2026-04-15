import '../../../assets/style.css'

const footerLinks = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Map', href: '#peta' },
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
      <div className="lj-container lj-footer-inner">
        <div className="lj-footer-brand">
          <h3>LaporJalan</h3>
          <p>
            Platform pelaporan kerusakan jalan berbasis peta untuk membantu
            masyarakat menyampaikan informasi secara cepat, jelas, dan mudah
            dipantau.
          </p>
        </div>

        <div className="lj-footer-links">
          <h4>Navigasi</h4>
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
          <div className="lj-footer-icons">
            {socialLinks.map((item) => (
              <a key={item.label} href={item.href} aria-label={item.label}>
                <img src={item.icon} alt={item.label} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
