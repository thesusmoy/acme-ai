import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Scale, Search, BookOpen, Menu, X } from 'lucide-react';

const navigationItems = [
    {
        title: 'Search',
        url: '/search',
        icon: Search,
    },
    {
        title: 'Document Library',
        url: '/library',
        icon: BookOpen,
    },
];

export default function Layout({ children }: { children?: React.ReactNode }) {
    const router = useRouter();
    const location = { pathname: router.pathname };
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedSidebarState = localStorage.getItem('sidebarOpen');
            return savedSidebarState ? JSON.parse(savedSidebarState) : false;
        }
        return false;
    });

    const handleSetSidebarOpen = (isOpen: boolean) => {
        setSidebarOpen(isOpen);
        localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
            >
                {/* Header */}
                <div className="border-b border-slate-800 p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Scale className="w-6 h-6 text-slate-900" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-100 text-lg">LegalSearch</h2>
                            <p className="text-xs text-slate-400">AI-Powered Legal Assistant</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-2">
                        Navigation
                    </p>
                    {navigationItems.map((item) => (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                                location.pathname === item.url
                                    ? 'bg-slate-800 text-yellow-500 border-l-2 border-yellow-500'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-yellow-500'
                            }`}
                            onClick={() => handleSetSidebarOpen(false)}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
                    <h2 className="font-bold text-slate-100 text-lg">LegalSearch</h2>
                    <button onClick={() => handleSetSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </header>
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
