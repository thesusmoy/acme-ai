import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Loader2, FileText, AlertCircle, Sparkles, Scale } from 'lucide-react';
import SearchResults from '../components/search/SearchResults';
import DocumentCard from '../components/search/DocumentCard';
import SkeletonCard from '../components/search/SkeletonCard';
import { usePageTransition } from '../hooks/usePageTransition';

interface DocumentData {
    id: string | number;
    title?: string;
    content?: string;
    [key: string]: unknown;
}

interface SearchResult {
    query: string;
    summary: string;
    documents: DocumentData[];
    legalConcepts: string[];
    timestamp: string;
}

export default function SearchPage() {
    const [query, setQuery] = useState<string>('');
    const [searching, setSearching] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState<boolean>(true);
    const containerRef = usePageTransition();
    const searchResultsRef = useRef(null);
    const availableDocsRef = useRef(null);

    // Fetch all documents on mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async (): Promise<void> => {
        try {
            const [response] = await Promise.all([
                fetch('https://acme-ai-lqwv.onrender.com/api/documents'),
                new Promise((resolve) => setTimeout(resolve, 1000)), // Minimum 1-second delay
            ]);

            const data = await response.json();
            setDocuments(data);
        } catch (err) {
            console.error('Error fetching documents:', err);
        } finally {
            setDocumentsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        setError(null);
        setSearchResults(null);

        try {
            const [response] = await Promise.all([
                fetch('https://acme-ai-lqwv.onrender.com/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                }),
                new Promise((resolve) => setTimeout(resolve, 1000)), // Minimum 1-second delay
            ]);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();

            setSearchResults({
                query,
                summary: data.summary,
                documents: data.relevant_documents || documents.slice(0, 3),
                legalConcepts: data.legal_concepts || [],
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            console.error('Search error:', err);
            setError('An error occurred while searching. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <Scale className="w-8 h-8 text-slate-900" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3">Legal Document Search</h1>
                    <p className="text-md md:text-lg text-slate-600 max-w-2xl mx-auto">
                        AI-powered legal research assistant for intelligent document search and analysis
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl border border-slate-200 mb-8 p-4 md:p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter your legal query..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    disabled={searching}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching || !query.trim()}
                                className="px-6 py-3 md:px-8 md:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {searching ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Searching...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Search
                                    </span>
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {documents.length} legal documents available for search
                        </p>
                    </form>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Search Results */}
                {searchResults && (
                    <div ref={searchResultsRef}>
                        <SearchResults results={searchResults} loading={searching} />
                    </div>
                )}

                {/* Available Documents */}
                {!searchResults && !searching && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Available Documents</h2>
                        </div>
                        {documentsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="p-12 text-center border-dashed border-2 border-slate-300 rounded-lg bg-white">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                <p className="text-slate-600 mb-4">No documents available yet.</p>
                                <p className="text-sm text-slate-500">
                                    Documents will appear here once added to the system.
                                </p>
                            </div>
                        ) : (
                            <div
                                ref={availableDocsRef}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {documents.slice(0, 6).map((doc) => (
                                    <DocumentCard key={doc.id} document={doc} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
