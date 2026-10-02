import type { InfoView } from './InfoPage';

interface FooterProps {
  onOpenPage: (page: InfoView) => void;
}

const Footer = ({ onOpenPage }: FooterProps) => {
  const linkClass = 'btn btn-link text-white-50 text-decoration-none hover-white p-0 d-inline-flex align-items-center';
  return (
    <footer className="bg-playhub-main border-top border-playhub py-5 mt-5">
      <div className="container text-center">
        <h2 className="text-white mb-3 fs-1">PlayHubPlace</h2>
        <p className="text-white-50 mx-auto mb-4 fs-5" style={{ maxWidth: '500px' }}>
          Free browser games, embedded from GamePix. No download and no account.
        </p>
        <div className="d-flex justify-content-center flex-wrap gap-4 mb-4 fs-5">
          <button type="button" className={linkClass} style={{ minHeight: '44px' }} onClick={() => onOpenPage('about')}>About</button>
          <button type="button" className={linkClass} style={{ minHeight: '44px' }} onClick={() => onOpenPage('privacy')}>Privacy policy</button>
          <button type="button" className={linkClass} style={{ minHeight: '44px' }} onClick={() => onOpenPage('terms')}>Terms</button>
          <button type="button" className={linkClass} style={{ minHeight: '44px' }} onClick={() => onOpenPage('contact')}>Contact</button>
        </div>
        <div className="text-white-50 small">
          &copy; {new Date().getFullYear()} PlayHubPlace. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
