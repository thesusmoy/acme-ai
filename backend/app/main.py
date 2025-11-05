from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import re
from datetime import datetime
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models import LegalDocument, SearchQuery, SearchResponse, DocumentSummary
from app.mock_data import LEGAL_DOCUMENTS

app = FastAPI(
    title="Legal Document Search API",
    description="AI-powered legal research assistant API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://acme-ai-legal-search.vercel.app", "https://acme-ai-legal-search.vercel.app/search", "https://acme-ai-legal-search.vercel.app/library", "https://acme-ai-lqwv.onrender.com/api/documents", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (simulating database)
documents_db = LEGAL_DOCUMENTS.copy()

# --- TF-IDF Implementation ---
vectorizer = TfidfVectorizer()
tfidf_matrix = None
document_ids = []

def preprocess_text(text: str) -> str:
    """Simple text preprocessing: lowercase, remove non-alphanumeric, remove extra spaces."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)  # Remove special characters
    text = re.sub(r'\s+', ' ', text).strip()  # Remove extra spaces
    return text

def initialize_tfidf():
    global tfidf_matrix, document_ids
    
    corpus = []
    for doc in documents_db:
        processed_content = preprocess_text(doc["content"])
        doc["processed_content"] = processed_content  # Store processed content
        corpus.append(processed_content)
        document_ids.append(doc["id"])
    
    if corpus:
        tfidf_matrix = vectorizer.fit_transform(corpus)
    else:
        tfidf_matrix = None

# Initialize TF-IDF on startup
initialize_tfidf()


@app.get("/")
def read_root():
    """Root endpoint with API information"""
    return {
        "message": "Legal Document Search API",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/documents": "Get all legal documents",
            "GET /api/documents/{document_id}": "Get specific document",
            "POST /generate": "Generate AI search results"
        }
    }


@app.get("/api/documents", response_model=List[LegalDocument])
def get_documents():
    """
    Get all legal documents
    Returns a list of all available legal documents in the system
    """
    return documents_db


@app.get("/api/documents/{document_id}", response_model=LegalDocument)
def get_document(document_id: str):
    """
    Get a specific document by ID
    """
    for doc in documents_db:
        if doc["id"] == document_id:
            return doc
    raise HTTPException(status_code=404, detail="Document not found")


@app.post("/generate", response_model=SearchResponse)
def generate_search_results(query: SearchQuery):
    """
    Generate AI-powered search results
    
    This endpoint simulates AI-powered search by:
    1. Analyzing the query against available documents
    2. Generating a summary response
    3. Identifying relevant documents
    4. Extracting key legal concepts
    """
    if not query.query or len(query.query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    if tfidf_matrix is None:
        raise HTTPException(status_code=500, detail="TF-IDF not initialized. No documents available.")

    processed_query = preprocess_text(query.query)
    query_vector = vectorizer.transform([processed_query])
    
    cosine_similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
    
    # Combine documents with their similarity scores
    scored_documents = []
    for i, doc_id in enumerate(document_ids):
        doc = next((d for d in documents_db if d["id"] == doc_id), None)
        if doc:
            scored_documents.append({"document": doc, "score": cosine_similarities[i]})
            
    # Sort documents by score in descending order
    scored_documents.sort(key=lambda x: x["score"], reverse=True)
    
    relevant_docs = [item["document"] for item in scored_documents if item["score"] > 0.1] # Threshold for relevance
    relevance_scores = [item["score"] for item in scored_documents if item["score"] > 0.1]

    # Fallback if no relevant documents found
    if not relevant_docs:
        relevant_docs = documents_db[:2]  # Return first 2 if no matches
        relevance_scores = [0.1, 0.05] # Assign minimal scores

    # Generate mock AI summary based on query type
    summary = generate_mock_summary(query.query, relevant_docs)
    
    # Extract legal concepts
    legal_concepts = extract_legal_concepts(query.query, relevant_docs)
    
    return SearchResponse(
        summary=summary,
        relevant_documents=[
            DocumentSummary(
                id=doc["id"],
                title=doc["title"],
                relevance_score=int(score * 100),  # Convert to percentage
                key_points=generate_key_points(doc)
            )
            for doc, score in zip(relevant_docs[:3], relevance_scores[:3])
        ],
        legal_concepts=legal_concepts,
        timestamp=datetime.utcnow().isoformat()
    )


def generate_mock_summary(query: str, relevant_docs: List[dict]) -> str:
    """Generate a mock AI summary based on query and documents"""
    query_lower = query.lower()
    
    # Contract-related queries
    if any(word in query_lower for word in ["contract", "breach", "agreement", "lease"]):
        return f"""Based on your query regarding "{query}", I've analyzed the relevant legal documents in our database.

Contract law principles indicate that when parties enter into an agreement, they create legally binding obligations. A breach occurs when one party fails to fulfill their contractual duties without legal justification.

The relevant documents show that remedies for breach of contract typically include:
1. Compensatory damages to put the non-breaching party in the position they would have been in had the contract been performed
2. Specific performance in cases where monetary damages are inadequate
3. Rescission and restitution to restore parties to pre-contract positions

Key considerations include whether an implied contract was formed through conduct, policies, or representations, even in the absence of a formal written agreement. Courts examine the totality of circumstances, including employee handbooks, established practices, and oral assurances."""

    # Privacy/CCPA queries
    elif any(word in query_lower for word in ["privacy", "data", "ccpa", "personal information"]):
        return f"""Regarding your query about "{query}", the California Consumer Privacy Act (CCPA) establishes comprehensive data protection rights for California residents.

Under CCPA, consumers have the right to:
1. Know what personal information is collected about them
2. Request deletion of their personal information
3. Opt-out of the sale of their personal information
4. Non-discrimination for exercising their privacy rights

Businesses subject to CCPA must have annual gross revenues exceeding $25 million, or handle personal information of 50,000+ consumers/devices, or derive 50% or more of annual revenues from selling consumer personal information.

The statute provides enforcement mechanisms including civil penalties up to $7,500 per intentional violation and a private right of action for data breaches ranging from $100-$750 per consumer per incident."""

    # Employment law queries
    elif any(word in query_lower for word in ["employment", "termination", "wrongful", "employee"]):
        return f"""In response to your question about "{query}", employment law principles generally follow the at-will doctrine, but important exceptions exist.

While at-will employment allows termination for any lawful reason, exceptions include:
1. Public policy violations (e.g., refusing to commit illegal acts)
2. Implied contract exceptions created through handbooks, policies, or practices
3. Implied covenant of good faith and fair dealing

Courts have held that detailed progressive discipline policies in employee handbooks can create enforceable implied contracts, limiting an employer's right to terminate without following stated procedures. This is particularly true when policy language suggests mandatory compliance rather than discretionary application.

Employers should carefully review their written policies to ensure they don't create unintended contractual obligations that limit at-will employment flexibility."""

    # General/fallback summary
    else:
        doc_titles = [doc["title"] for doc in relevant_docs[:2]]
        return f"""Based on your query "{query}", I've identified relevant legal precedents and documentation.

The analysis draws from multiple sources including {doc_titles[0] if doc_titles else 'case law'} and related legal materials. 

Key findings indicate that legal principles in this area emphasize:
1. The importance of documented agreements and established procedures
2. Balance between statutory requirements and contractual obligations
3. Protection of individual rights while maintaining institutional flexibility

The documents demonstrate how courts interpret both explicit contractual terms and implied obligations arising from conduct, custom, and practice. Legal remedies are designed to restore injured parties to their rightful position while deterring future violations.

For comprehensive legal advice tailored to your specific situation, consultation with a qualified attorney is recommended."""

    return summary


def generate_key_points(doc: dict) -> str:
    """Generate key points for a document"""
    category = doc.get("category", "")
    
    if category == "case_law":
        return "Establishes precedent on implied contract formation; demonstrates how employer policies can create enforceable obligations"
    elif category == "contract":
        return "Details comprehensive lease terms including rent escalation, maintenance obligations, and early termination provisions"
    elif category == "statute":
        return "Grants consumers rights to access, delete, and control sale of personal information; establishes enforcement mechanisms"
    else:
        return "Relevant legal document providing guidance on applicable law and precedent"


def extract_legal_concepts(query: str, docs: List[dict]) -> List[str]:
    """Extract relevant legal concepts from query and documents"""
    query_lower = query.lower()
    concepts = set()
    
    # Keyword-based concept extraction
    concept_keywords = {
        "Breach of Contract": ["breach", "contract", "agreement", "violation"],
        "Implied Contract": ["implied", "handbook", "policy", "expectation"],
        "At-Will Employment": ["at-will", "employment", "termination", "fire"],
        "Consumer Privacy Rights": ["privacy", "data", "personal information", "ccpa"],
        "Right to Delete": ["delete", "removal", "erasure", "data"],
        "Commercial Lease": ["lease", "rent", "landlord", "tenant"],
        "Progressive Discipline": ["discipline", "warning", "progressive", "termination"],
        "Damages and Remedies": ["damages", "remedy", "compensation", "penalty"],
        "Good Faith": ["good faith", "fair dealing", "honest"],
        "Legal Compliance": ["compliance", "statute", "regulation", "law"]
    }
    
    for concept, keywords in concept_keywords.items():
        if any(keyword in query_lower for keyword in keywords):
            concepts.add(concept)
    
    # Add concepts from document keywords
    for doc in docs[:2]:
        if doc.get("keywords"):
            for keyword in doc["keywords"][:2]:
                concepts.add(keyword.title())
    
    return list(concepts)[:5]  # Return max 5 concepts


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "documents_count": len(documents_db),
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)