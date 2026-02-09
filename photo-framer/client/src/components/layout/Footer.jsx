import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-copyright">
          All photos are copyright Tomas Quinones. All Rights Reserved.
        </p>
        <p className="footer-info">
          <a href="https://tomasquinones.com">tomasquinones.com</a> | Photo-Framer {currentYear}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
