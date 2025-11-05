'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, MapPin, Users, Hash, Loader2, Sparkles, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import SkeletonDocumentDetail from '../components/search/SkeletonDocumentDetail';
import { usePageTransition } from '../hooks/usePageTransition';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';

type LegalDocument = {
    id: string;
    title: string;
    category: string;
    case_number?: string;
    court?: string;
    date?: string;
    jurisdiction?: string;
    parties?: string;
    summary?: string;
    content: string;
    keywords?: string[];
};

type AISummary = {
    executive_summary: string;
    key_principles: string[];
};

export default function DocumentDetailPage({ documentId }: { documentId: string }) {
    const router = useRouter();

    const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<AISummary | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = usePageTransition();

    // Fetch document on mount
    useEffect(() => {
        if (!documentId) {
            setError('No document ID provided');
            setLoading(false);
            return;
        }

        fetchDocument();
    }, [documentId]);

    const fetchDocument = async () => {
        try {
            const [response] = await Promise.all([
                fetch(`https://acme-ai-lqwv.onrender.com/api/documents/${documentId}`),
                new Promise((resolve) => setTimeout(resolve, 1000)),
            ]);

            if (!response.ok) {
                throw new Error('Document not found');
            }

            const data = await response.json();
            setLegalDocument(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const generateSummary = async () => {
        if (!legalDocument) return;

        setLoadingSummary(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `Provide a detailed legal analysis and summary of the following document:

Title: ${legalDocument.title}
Category: ${legalDocument.category}
Content: ${legalDocument.content}

Please provide:
1. A comprehensive summary (2-3 paragraphs)
2. Key legal principles and holdings
3. Practical implications
4. Important precedents or citations

Format your response professionally for legal research purposes.`,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate summary');
            }

            const data = await response.json();

            // Adapt the response to match expected format
            setSummary({
                executive_summary: data.summary || '',
                key_principles: data.legal_concepts || [],
            });
        } catch (err) {
            console.error('Error generating summary:', err);
            alert('Failed to generate AI summary. Please try again.');
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleExport = () => {
        if (typeof window === 'undefined' || !legalDocument) return;

        const doc = new jsPDF();
        let yPos = 10;
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const lineHeight = 7;

        // Add title
        doc.setFontSize(18);
        doc.text(legalDocument.title, margin, yPos);
        yPos += 10;

        // Add category and keywords
        doc.setFontSize(10);
        const categoriesAndKeywords = [
            legalDocument.category.replace(/_/g, ' ').toUpperCase(),
            ...(legalDocument.keywords || []).slice(0, 3).map((k) => k.toUpperCase()),
        ].join(' | ');
        doc.text(categoriesAndKeywords, margin, yPos);
        yPos += 10;

        // Add metadata
        doc.setFontSize(12);
        if (legalDocument.case_number) {
            doc.text(`Case Number: ${legalDocument.case_number}`, margin, yPos);
            yPos += lineHeight;
        }
        if (legalDocument.court) {
            doc.text(`Court: ${legalDocument.court}`, margin, yPos);
            yPos += lineHeight;
        }
        if (legalDocument.date) {
            doc.text(`Date: ${formatDate(legalDocument.date)}`, margin, yPos);
            yPos += lineHeight;
        }
        if (legalDocument.jurisdiction) {
            doc.text(`Jurisdiction: ${legalDocument.jurisdiction}`, margin, yPos);
            yPos += lineHeight;
        }
        if (legalDocument.parties) {
            doc.text(`Parties: ${legalDocument.parties}`, margin, yPos);
            yPos += lineHeight;
        }
        yPos += 5; // Extra space after metadata

        // Add summary if available
        if (legalDocument.summary) {
            doc.setFontSize(14);
            doc.text('Summary:', margin, yPos);
            yPos += lineHeight;
            doc.setFontSize(12);
            const summaryLines = doc.splitTextToSize(legalDocument.summary, pageWidth - 2 * margin);
            doc.text(summaryLines, margin, yPos);
            yPos += summaryLines.length * lineHeight + 5;
        }

        // Add full document content
        doc.setFontSize(14);
        doc.text('Full Document Content:', margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);

        const contentLines = doc.splitTextToSize(legalDocument.content, pageWidth - 2 * margin);
        contentLines.forEach((line: string) => {
            if (yPos + lineHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });

        doc.save(`${legalDocument.title.replace(/ /g, '_')}.pdf`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const categoryColors: Record<string, string> = {
        case_law: 'bg-blue-100 text-blue-800 border-blue-300',
        contract: 'bg-green-100 text-green-800 border-green-300',
        statute: 'bg-purple-100 text-purple-800 border-purple-300',
        regulation: 'bg-orange-100 text-orange-800 border-orange-300',
        brief: 'bg-pink-100 text-pink-800 border-pink-300',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
                <SkeletonDocumentDetail />
            </div>
        );
    }

    if (error || !legalDocument) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-lg text-slate-600 mb-4">{error || 'Document not found'}</p>
                    <button
                        onClick={() => router.push('/library')}
                        className="px-6 py-2 bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                    >
                        Return to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => router.push('/library')}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Library
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                {/* Main Document Card */}
                <div className="bg-white rounded-lg shadow-xl mb-6 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-slate-200 bg-slate-50 p-6">
                        <h1 className="text-3xl font-bold text-slate-900 mb-3">{legalDocument.title}</h1>
                        <div className="flex flex-wrap gap-3">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                                    categoryColors[legalDocument.category] ||
                                    'bg-gray-100 text-gray-800 border-gray-300'
                                }`}
                            >
                                {legalDocument.category.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            {legalDocument.keywords?.slice(0, 3).map((keyword, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 text-sm border border-slate-300 rounded-full text-slate-700"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Metadata Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-slate-200">
                            {legalDocument.case_number && (
                                <div className="flex items-start gap-3">
                                    <Hash className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Case Number</p>
                                        <p className="font-semibold text-slate-900">{legalDocument.case_number}</p>
                                    </div>
                                </div>
                            )}
                            {legalDocument.court && (
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Court</p>
                                        <p className="font-semibold text-slate-900">{legalDocument.court}</p>
                                    </div>
                                </div>
                            )}
                            {legalDocument.date && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Date</p>
                                        <p className="font-semibold text-slate-900">{formatDate(legalDocument.date)}</p>
                                    </div>
                                </div>
                            )}
                            {legalDocument.jurisdiction && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Jurisdiction</p>
                                        <p className="font-semibold text-slate-900">{legalDocument.jurisdiction}</p>
                                    </div>
                                </div>
                            )}
                            {legalDocument.parties && (
                                <div className="flex items-start gap-3 md:col-span-2">
                                    <Users className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Parties</p>
                                        <p className="font-semibold text-slate-900">{legalDocument.parties}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        {legalDocument.summary && (
                            <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-2">Summary</h3>
                                <p className="text-slate-700 leading-relaxed">{legalDocument.summary}</p>
                            </div>
                        )}

                        {/* Full Document Content */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900 text-lg">Full Document Content</h3>
                                {!summary && (
                                    <button
                                        onClick={generateSummary}
                                        disabled={loadingSummary}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 rounded-lg font-semibold transition-all disabled:opacity-50"
                                    >
                                        {loadingSummary ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                AI Analysis
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="prose prose-slate max-w-none p-6 bg-white rounded-lg border border-slate-200">
                                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                    {legalDocument.content}
                                </p>
                            </div>
                        </div>

                        {/* AI Summary */}
                        {summary && (
                            <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-yellow-500 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="w-5 h-5 text-yellow-600" />
                                    <h3 className="text-xl font-bold text-slate-900">AI-Generated Analysis</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                                        <p className="text-slate-700 leading-relaxed">{summary.executive_summary}</p>
                                    </div>

                                    {summary.key_principles?.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3">Legal Concepts</h4>
                                            <ul className="space-y-2">
                                                {summary.key_principles.map((principle, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-yellow-600 mt-1">•</span>
                                                        <span className="text-slate-700">{principle}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { id } = context.query;
    return { props: { documentId: id as string } };
};
