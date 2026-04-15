'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-[#1E4A39] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center">
          <span 
            className="text-white text-[22px] font-bold tracking-[-0.01em]"
            style={{ fontFamily: "Poppins" }}
          >
            Talent<span className="text-[#E9BD55]">Flow</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[#D1D5DB] text-sm font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="/" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/" className="hover:text-white transition-colors">
            Modules
          </Link>
          <Link href="/" className="hover:text-white transition-colors">
            Stories
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <button className="px-6 py-2 text-sm text-[#D1D5DB] border border-[#1F8A8A] rounded-xl hover:bg-[#1F8A8A]/10 transition-colors">
              Sign in
            </button>
          </Link>
          <Link href="/register">
            <button className="bg-[#E4AE2F] hover:bg-[#E9BD55] text-black font-medium text-sm px-7 py-2 rounded-xl transition-colors">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#1E4A39] border-t border-[#2A5C4A]">
          <div className="px-6 py-8 flex flex-col gap-6 text-[#D1D5DB]">
            <Link 
              href="/" 
              className="text-lg hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              How it works
            </Link>
            <Link 
              href="/" 
              className="text-lg hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/" 
              className="text-lg hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Modules
            </Link>
            <Link 
              href="/" 
              className="text-lg hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Stories
            </Link>

            {/* Mobile Buttons */}
            <div className="flex flex-col gap-4 pt-6 border-t border-[#2A5C4A]">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <button className="w-full py-3 text-[#D1D5DB] border border-[#1F8A8A] rounded-xl hover:bg-[#1F8A8A]/10 transition-colors">
                  Sign in
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <button className="w-full bg-[#E4AE2F] hover:bg-[#E9BD55] text-black font-medium py-3 rounded-xl transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}