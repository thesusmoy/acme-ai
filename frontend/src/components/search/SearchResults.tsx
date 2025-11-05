import { Sparkles, FileText, Clock, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import DocumentCard from './DocumentCard';

type Document = {
    id: string | number;
    title?: string;
    category?: string;
    date?: string;
    case_number?: string;
    summary?: string;
    keywords?: string[];
};

type Results = {
    timestamp?: string | number;
    query?: string;
    summary?: string;
    legalConcepts?: string[];
    documents?: Document[];
};

export default function SearchResults({ results, loading }: { results: Results; loading?: boolean }) {
    const formattedTime = (() => {
        if (!results?.timestamp) return null;
        const d = new Date(results.timestamp);
        return isNaN(d.getTime()) ? null : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    })();

    const handleExport = () => {
        if (typeof window === 'undefined' || !results) return;

        const doc = new jsPDF();
        let yPos = 10;
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const lineHeight = 7;

        // Add title
        doc.setFontSize(18);
        doc.text('AI Research Summary', margin, yPos);
        yPos += 10;

        // Add query
        doc.setFontSize(12);
        doc.text(`Your Query: "${results.query ?? ''}"`, margin, yPos);
        yPos += 10;

        // Add summary
        doc.setFontSize(12);
        const summaryLines = doc.splitTextToSize(results.summary || '', pageWidth - 2 * margin);
        doc.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * lineHeight + 5;

        // Add legal concepts
        if (results.legalConcepts && results.legalConcepts.length > 0) {
            doc.setFontSize(14);
            doc.text('Key Legal Concepts:', margin, yPos);
            yPos += lineHeight;
            doc.setFontSize(12);
            results.legalConcepts.forEach((concept: string) => {
                if (yPos + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(`• ${concept}`, margin, yPos);
                yPos += lineHeight;
            });
            yPos += 5;
        }

        // Add relevant documents
        if (results.documents && results.documents.length > 0) {
            doc.addPage();
            yPos = margin;
            doc.setFontSize(18);
            doc.text('Relevant Documents', margin, yPos);
            yPos += 10;

            results.documents.forEach((document: Document) => {
                if (yPos + 20 > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.setFontSize(14);
                doc.text(document.title || '', margin, yPos);
                yPos += lineHeight;
                doc.setFontSize(10);
                doc.text(`Category: ${document.category || 'N/A'}`, margin, yPos);
                yPos += lineHeight;
                doc.text(`Date: ${document.date || 'N/A'}`, margin, yPos);
                yPos += lineHeight + 5;
            });
        }

        doc.save('ai_research_summary.pdf');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* AI Summary */}
            <div className="bg-white rounded-lg shadow-xl border-2 border-yellow-500 overflow-hidden">
                <div className="bg-linear-to-r from-yellow-50 to-white p-4 md:p-6 border-b border-yellow-200">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <h2 className="flex items-center gap-2 text-slate-900 text-lg md:text-xl font-bold mb-2 md:mb-0">
                            <Sparkles className="w-6 h-6 text-yellow-600" />
                            AI Research Summary
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="w-4 h-4" />
                                {formattedTime}
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export as PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600 mb-2 font-medium">Your Query:</p>
                        <p className="text-slate-900 font-semibold italic">{`"${results.query ?? ''}"`}</p>
                    </div>

                    <div>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{results.summary}</p>
                    </div>

                    {results.legalConcepts && results.legalConcepts.length > 0 && (
                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-sm font-semibold text-slate-700 mb-3">Key Legal Concepts:</p>
                            <div className="flex flex-wrap gap-2">
                                {results.legalConcepts.map((concept: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-white border border-yellow-500 text-slate-700 rounded-full text-sm"
                                    >
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Relevant Documents */}
            {results.documents && results.documents.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-6 h-6 text-yellow-600" />
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                            Relevant Documents ({results.documents?.length ?? 0})
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.documents?.map((doc: Document) => (
                            <DocumentCard key={doc.id} document={doc} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
