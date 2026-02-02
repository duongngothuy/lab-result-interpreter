from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import AnalysisResponse
from app.services.pdf_parser import extract_text_from_pdf
from app.services.lab_extractor import extract_lab_results
from app.services.rag_engine import get_rag_engine
from app.services.claude_client import generate_explanations

router = APIRouter(prefix="/api", tags=["lab-results"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_lab_report(file: UploadFile = File(...)):
    """Upload a lab report PDF and get plain-English explanations."""
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Read file
    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")

    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Step 1: Extract text from PDF
    try:
        raw_text = extract_text_from_pdf(pdf_bytes)
    except Exception:
        raise HTTPException(
            status_code=422,
            detail="Could not read the PDF file. Please ensure it is a valid PDF.",
        )

    if not raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from the PDF. It may be a scanned image. "
            "Please upload a digitally-generated lab report.",
        )

    # Step 2: Extract lab values
    lab_results = extract_lab_results(raw_text)

    if not lab_results:
        raise HTTPException(
            status_code=422,
            detail="No lab results could be identified in the PDF. "
            "Please ensure this is a standard lab report.",
        )

    # Step 3: RAG retrieval
    rag_engine = get_rag_engine()
    test_names = [r.test_name for r in lab_results]
    medical_context = rag_engine.retrieve_for_tests(test_names)

    # Step 4: Claude explanations
    try:
        explanations, summary = generate_explanations(lab_results, medical_context)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Error generating explanations: {str(e)}",
        )

    # Attach explanations to results
    for result, explanation in zip(lab_results, explanations):
        result.explanation = explanation

    return AnalysisResponse(lab_results=lab_results, summary=summary)
