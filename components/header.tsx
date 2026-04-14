import Image from "next/image";
import Link from "next/link";

export default function Header(){
    return(
        <header className="w-full min-h-[70px] bg-[#1E4A39] flex items-center justify-between px-10">
            <span style={{fontFamily: "Poppins",fontSize: 18,fontWeight: 700,color: "white",letterSpacing: "-0.01em",}}>Talent<span style={{ color: "#E9BD55" }}>Flow</span></span>
            <nav className="text-[#D1D5DB] space-x-7">
                <Link href="/">How it works</Link>
                <Link href="/">Features</Link>
                <Link href="/">Modules</Link>
                <Link href="/">Stories</Link>
            </nav>
            <div className="space-x-5">
                <Link href="/login">
                    <button className="px-5 text-[#D1D5DB] text-sm cursor-pointer rounded-lg py-2 border-[#1F8A8A] border-solid border-1">Sign in</button>
                </Link>
                <Link href="/register">
                    <button className="bg-[#E4AE2F] text-[#D1D5DB] text-sm px-7 rounded-sm py-2 cursor-pointer">Get Started</button>
                </Link>
            </div>
        </header>
    )
}