import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./client/MobileMenu";
import AuthButtons from "./client/AuthButtons";

export default function Header() {
  return (
    <header className="bg-orange-200 shadow text-orange-900">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-4 py-2">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/Logo.png" 
              alt="Logo" 
              height={100} 
              width={250} 
              className="h-12 w-auto sm:h-16" 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center flex-grow">
          <ul className="flex space-x-8">
            <li>
              <Link href="/climblog" className="text-gray-700 hover:text-orange-600 text-lg font-medium">
                ClimbLog
              </Link>
            </li>
            <li>
              <Link href="/hold-extraction" className="text-gray-700 hover:text-orange-600 text-lg font-medium">
                ClimbSnap
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-700 hover:text-orange-600 text-lg font-medium">
                お問い合わせ
              </Link>
            </li>
          </ul>
        </div>

        {/* Desktop Auth Buttons */}
        <AuthButtons />

        {/* Mobile Menu */}
        <MobileMenu />
      </nav>
    </header>
  );
}