import React from 'react';

export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
            <div className="p-4 space-y-4">
                <div className="h-4 w-1/2 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-full bg-slate-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                    <div className="h-5 w-16 bg-slate-200 rounded-md animate-pulse"></div>
                    <div className="h-5 w-20 bg-slate-200 rounded-md animate-pulse"></div>
                    <div className="h-5 w-12 bg-slate-200 rounded-md animate-pulse"></div>
                </div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
        </div>
    );
}
