import { NavLink } from 'react-router-dom';

interface NavbarProps {
  siteName: string;
}

export default function Navbar({ siteName }: NavbarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide transition-opacity ${isActive ? 'font-semibold' : 'opacity-50 hover:opacity-100'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-white border-b border-black">
      <NavLink to="/work" className="text-sm font-semibold tracking-widest uppercase">
        {siteName}
      </NavLink>
      <div className="flex gap-8">
        <NavLink to="/cv" className={linkClass}>CV</NavLink>
        <NavLink to="/work" className={linkClass}>Work</NavLink>
      </div>
    </nav>
  );
}
