import Footer from '../../Footer';

export default function PagesLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
