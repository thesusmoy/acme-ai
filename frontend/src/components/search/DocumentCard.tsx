import { FileText, Calendar, ExternalLink, Hash } from 'lucide-react';
import Link from 'next/link';

type Document = {
    id: string | number;
    title?: string;
    category?: string;
    date?: string;
    case_number?: string;
    summary?: string;
    keywords?: string[];
};

export default function DocumentCard({ document }: { document: Document }) {
    const categoryColors: Record<string, string> = {
        case_law: 'bg-blue-100 text-blue-800 border-blue-300',
        contract: 'bg-green-100 text-green-800 border-green-300',
        statute: 'bg-purple-100 text-purple-800 border-purple-300',
        regulation: 'bg-orange-100 text-orange-800 border-orange-300',
        brief: 'bg-pink-100 text-pink-800 border-pink-300',
    };

    const cat = document?.category ?? 'unknown';
    const badgeClass = `px-3 py-1 rounded-full text-xs font-semibold border ${
        categoryColors[cat] ?? 'bg-gray-100 text-gray-800 border-gray-300'
    }`;

    const formattedDate = (() => {
        if (!document?.date) return null;
        const d = new Date(document.date);
        return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    })();

    return (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 hover:shadow-xl hover:border-yellow-500 transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={badgeClass}>
                        {(document?.category ?? 'UNKNOWN').replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {formattedDate && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                        </div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-yellow-600 transition-colors">
                    {document?.title ?? 'Untitled'}
                </h3>
            </div>

            {/* Content */}
            <div className="p-4">
                {document?.case_number && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span className="font-mono">{document.case_number}</span>
                    </div>
                )}

                {document?.summary && (
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{document.summary}</p>
                )}

                {document?.keywords && document.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {document.keywords.slice(0, 3).map((keyword, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 text-xs border border-slate-300 rounded-md text-slate-600"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                )}

                <Link
                    href={`/document-detail?id=${document.id}`}
                    className="flex items-center justify-center w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:border-yellow-500 hover:bg-yellow-500 hover:text-slate-900 transition-all"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                    <ExternalLink className="w-3 h-3 ml-auto" />
                </Link>
            </div>
        </div>
    );
}
