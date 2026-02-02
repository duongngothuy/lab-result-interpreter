from pydantic import BaseModel
from enum import Enum


class ResultStatus(str, Enum):
    NORMAL = "normal"
    ABNORMAL = "abnormal"
    CRITICAL = "critical"


class LabResult(BaseModel):
    test_name: str
    value: float
    unit: str
    reference_range: str
    status: ResultStatus
    explanation: str = ""


class AnalysisResponse(BaseModel):
    lab_results: list[LabResult]
    summary: str
    disclaimer: str = (
        "This analysis is for informational purposes only and does not constitute "
        "medical advice. Please consult your healthcare provider for interpretation "
        "of your lab results and any medical decisions."
    )
