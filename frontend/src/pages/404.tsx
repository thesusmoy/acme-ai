import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">Page Not Found</p>
      <p className="text-md mt-2 text-slate-600">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="mt-8 px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-colors">
          Go back home
      </Link>
    </div>
  );
}
