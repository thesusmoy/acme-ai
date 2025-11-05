import { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import DocumentCard from '../components/search/DocumentCard';
import SkeletonCard from '../components/search/SkeletonCard';
import { usePageTransition } from '../hooks/usePageTransition';

type Document = {
    id: string | number;
    title?: string;
    category?: string;
    date?: string;
    case_number?: string;
    summary?: string;
    keywords?: string[];
};

export default function LibraryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = usePageTransition();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const [response] = await Promise.all([
                fetch('https://acme-ai-lqwv.onrender.com/api/documents'),
                new Promise((resolve) => setTimeout(resolve, 1000)), // Minimum 1-second delay
            ]);

            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDocuments = documents.filter((doc: Document) => {
        const matchesSearch =
            !searchTerm ||
            doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.summary?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    return (
        <div ref={containerRef} className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Document Library</h1>
                    <p className="text-lg text-slate-600">Browse and explore all available legal documents</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, case number, or keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="case_law">Case Law</option>
                                <option value="contract">Contract</option>
                                <option value="statute">Statute</option>
                                <option value="regulation">Regulation</option>
                                <option value="brief">Brief</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="w-4 h-4" />
                        <span>{filteredDocuments.length} documents found</span>
                    </div>
                </div>

                {/* Documents Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="p-12 text-center border-dashed border-2 border-slate-300 rounded-lg bg-white">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-600 text-lg mb-2">No documents found</p>
                        <p className="text-sm text-slate-500">
                            {searchTerm || categoryFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Documents will appear here once added'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocuments.map((doc: Document) => (
                            <DocumentCard key={doc.id} document={doc} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
