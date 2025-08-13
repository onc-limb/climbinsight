import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./client/MobileMenu";
import AuthButtons from "./client/AuthButtons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-700 hover:text-orange-600 text-lg font-medium cursor-pointer">
                    機能
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white shadow-lg rounded-md p-2">
                  <DropdownMenuItem asChild>
                    <Link href="/hold-extraction" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      画像加工
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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