from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class LegalDocument(BaseModel):
    id: str
    title: str
    case_number: Optional[str] = None
    court: Optional[str] = None
    date: Optional[str] = None
    category: str
    summary: Optional[str] = None
    content: str
    jurisdiction: Optional[str] = None
    parties: Optional[str] = None
    keywords: Optional[List[str]] = None
    processed_content: Optional[str] = None


class SearchQuery(BaseModel):
    query: str


class DocumentSummary(BaseModel):
    id: str
    title: str
    relevance_score: int
    key_points: str


class SearchResponse(BaseModel):
    summary: str
    relevant_documents: List[DocumentSummary]
    legal_concepts: List[str]
    timestamp: str