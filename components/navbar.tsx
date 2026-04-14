import { Search, User, Bell } from "lucide-react";

export default function Navbar() {
    return (
        <div className="w-full sticky top-0 z-50 border-b shadow-lg bg-white py-3">
            <div className="mx-auto px-15 flex max-w-6xl items-center justify-between">
                
                {/* Search Bar */}
                <div className="flex items-center gap-2 rounded-lg border border-[#1F8A8A] bg-white px-5 py-2 w-[320px]">
                    <button>
                        <Search size={16} className="text-gray-400 cursor-pointer" />
                    </button>
                    <input
                        type="text"
                        placeholder="Search courses, lessons, projects"
                        className="w-full bg-transparent text-sm outline-none text-gray-600 placeholder:text-gray-400 placeholder-shown:text-gray-400"
                    />
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-6 text-gray-600">
                    <User className="cursor-pointer hover:text-black" size={24} />
                    <Bell className="cursor-pointer hover:text-black" size={24} />
                </div>
                
            </div>
        </div>
    );
}