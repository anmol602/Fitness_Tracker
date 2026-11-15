
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    Activity,
    LayoutDashboard,
    Dumbbell,
    Apple,
    TrendingUp,
    BarChart3,
    User,
    LogOut,
    Menu,
    X
} from "lucide-react";

export default function Layout() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const links = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/workouts", label: "Workouts", icon: Dumbbell },
        { to: "/nutrition", label: "Nutrition", icon: Apple },
        { to: "/profile", label: "Profile", icon: User },
        { to: "/progress", label: "Progress", icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#080B08] text-white">

            {/* Mobile Top Bar */}
            <header className="md:hidden sticky top-0 z-40 h-16 bg-[#0D120D]/95 backdrop-blur border-b border-[#26391C] flex items-center justify-between px-4">
                <button
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                    className="w-10 h-10 grid place-items-center rounded-xl text-gray-300 hover:text-[#B7FF4A] hover:bg-[#182016] transition"
                >
                    <Menu size={24} />
                </button>

                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="text-[#B7FF4A]" size={24} />
                    Fitness <span className="text-[#B7FF4A]">Tracker</span>
                </h1>

                <button
                    onClick={logout}
                    aria-label="Logout"
                    className="w-10 h-10 grid place-items-center rounded-xl text-gray-300 hover:text-red-400 hover:bg-[#182016] transition"
                >
                    <LogOut size={20} />
                </button>
            </header>

            {/* Mobile Slide-in Menu */}
            {menuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setMenuOpen(false)}
                    />

                    <aside className="absolute top-0 left-0 h-full w-72 max-w-[85%] bg-[#0D120D] border-r border-[#26391C] p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Activity className="text-[#B7FF4A]" size={28} />
                                Fitness<span className="text-[#B7FF4A]">Tracker</span>
                            </h1>

                            <button
                                onClick={() => setMenuOpen(false)}
                                aria-label="Close menu"
                                className="w-10 h-10 grid place-items-center rounded-xl text-gray-400 hover:text-[#B7FF4A] hover:bg-[#182016] transition"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <nav className="space-y-3 flex-1">
                            {links.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={() => setMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-xl transition ${isActive
                                            ? "bg-[#B7FF4A] text-black font-bold"
                                            : "text-gray-400 hover:bg-[#182016] hover:text-[#B7FF4A]"
                                        }`
                                    }
                                >
                                    <Icon size={20} />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>

                        <button
                            onClick={logout}
                            className="flex items-center gap-3 text-gray-400 hover:text-red-400 p-3"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </aside>
                </div>
            )}

            {/* Desktop Sidebar + Page Content */}
            <div className="flex flex-1">

                {/* Sidebar (desktop) */}
                <aside className="w-64 bg-[#0D120D] border-r border-[#26391C] p-6 hidden md:flex flex-col">

                    <h1 className="text-2xl font-bold flex items-center gap-2 mb-12">
                        <Activity className="text-[#B7FF4A]" size={30} />
                        Fitness <span className="text-[#B7FF4A]">Tracker</span>
                    </h1>

                    <p className="text-xs text-gray-500 mb-5 uppercase tracking-widest">
                        Main Menu
                    </p>

                    <nav className="space-y-3">
                        {links.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 p-3 rounded-xl transition ${isActive
                                        ? "bg-[#B7FF4A] text-black font-bold"
                                        : "text-gray-400 hover:bg-[#182016] hover:text-[#B7FF4A]"
                                    }`
                                }
                            >
                                <Icon size={20} />
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <button
                        onClick={logout}
                        className="mt-auto flex items-center gap-3 text-gray-400 hover:text-red-400 p-3"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>

                </aside>

                {/* Page Content */}
                <main className="page-bg flex-1 p-0 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
