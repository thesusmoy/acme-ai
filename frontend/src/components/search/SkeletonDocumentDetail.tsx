export default function SkeletonDocumentDetail() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
            <div className="bg-white rounded-lg shadow-xl mb-6 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 p-6">
                    <div className="h-10 w-3/4 bg-slate-200 rounded-lg animate-pulse mb-4"></div>
                    <div className="flex flex-wrap gap-3">
                        <div className="h-8 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                        <div className="h-8 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                        <div className="h-8 w-28 bg-slate-200 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-slate-200">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-yellow-200 rounded animate-pulse mt-0.5"></div>
                            <div>
                                <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse mb-2"></div>
                                <div className="h-5 w-48 bg-slate-200 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-yellow-200 rounded animate-pulse mt-0.5"></div>
                            <div>
                                <div className="h-4 w-16 bg-slate-200 rounded-full animate-pulse mb-2"></div>
                                <div className="h-5 w-40 bg-slate-200 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-yellow-200 rounded animate-pulse mt-0.5"></div>
                            <div>
                                <div className="h-4 w-12 bg-slate-200 rounded-full animate-pulse mb-2"></div>
                                <div className="h-5 w-36 bg-slate-200 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-yellow-200 rounded animate-pulse mt-0.5"></div>
                            <div>
                                <div className="h-4 w-20 bg-slate-200 rounded-full animate-pulse mb-2"></div>
                                <div className="h-5 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-3"></div>
                        <div className="h-4 w-full bg-slate-200 rounded-full animate-pulse mb-2"></div>
                        <div className="h-4 w-full bg-slate-200 rounded-full animate-pulse mb-2"></div>
                        <div className="h-4 w-2/3 bg-slate-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
                            <div className="h-10 w-36 bg-yellow-200 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="prose prose-slate max-w-none p-6 bg-white rounded-lg border border-slate-200">
                            <div className="h-4 w-full bg-slate-200 rounded-full animate-pulse mb-2"></div>
                            <div className="h-4 w-full bg-slate-200 rounded-full animate-pulse mb-2"></div>
                            <div className="h-4 w-full bg-slate-200 rounded-full animate-pulse mb-2"></div>
                            <div className="h-4 w-1/2 bg-slate-200 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
