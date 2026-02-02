import os
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

KNOWLEDGE_DIR = Path(__file__).parent.parent / "data" / "medical_knowledge"
CHUNK_SIZE = 500  # characters per chunk
CHUNK_OVERLAP = 100


class RAGEngine:
    def __init__(self):
        self.chunks: list[str] = []
        self.vectorizer: TfidfVectorizer | None = None
        self.tfidf_matrix = None
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Load and chunk all medical knowledge text files."""
        for filepath in sorted(KNOWLEDGE_DIR.glob("*.txt")):
            text = filepath.read_text(encoding="utf-8")
            self.chunks.extend(self._split_into_chunks(text))

        if self.chunks:
            self.vectorizer = TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                max_features=5000,
            )
            self.tfidf_matrix = self.vectorizer.fit_transform(self.chunks)

    def _split_into_chunks(self, text: str) -> list[str]:
        """Split text into overlapping chunks, splitting on paragraph boundaries."""
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(current_chunk) + len(para) < CHUNK_SIZE:
                current_chunk += "\n\n" + para if current_chunk else para
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = para

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def retrieve(self, query: str, top_k: int = 5) -> list[str]:
        """Retrieve the top-k most relevant chunks for a query."""
        if not self.vectorizer or self.tfidf_matrix is None:
            return []

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        top_indices = similarities.argsort()[-top_k:][::-1]
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.05:  # minimum relevance threshold
                results.append(self.chunks[idx])

        return results

    def retrieve_for_tests(self, test_names: list[str]) -> str:
        """Retrieve relevant context for a list of lab test names."""
        query = " ".join(test_names)
        chunks = self.retrieve(query, top_k=8)
        return "\n\n---\n\n".join(chunks)


# Singleton instance
_engine: RAGEngine | None = None


def get_rag_engine() -> RAGEngine:
    global _engine
    if _engine is None:
        _engine = RAGEngine()
    return _engine
