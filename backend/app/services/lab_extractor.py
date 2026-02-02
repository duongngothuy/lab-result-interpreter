import re
from app.models.schemas import LabResult, ResultStatus


# Known lab tests with their common names and expected units
KNOWN_TESTS = {
    # Complete Blood Count (CBC)
    "wbc": {"name": "White Blood Cell Count", "unit": "10^3/uL"},
    "white blood cell": {"name": "White Blood Cell Count", "unit": "10^3/uL"},
    "rbc": {"name": "Red Blood Cell Count", "unit": "10^6/uL"},
    "red blood cell": {"name": "Red Blood Cell Count", "unit": "10^6/uL"},
    "hemoglobin": {"name": "Hemoglobin", "unit": "g/dL"},
    "hgb": {"name": "Hemoglobin", "unit": "g/dL"},
    "hematocrit": {"name": "Hematocrit", "unit": "%"},
    "hct": {"name": "Hematocrit", "unit": "%"},
    "platelet": {"name": "Platelet Count", "unit": "10^3/uL"},
    "plt": {"name": "Platelet Count", "unit": "10^3/uL"},
    "mcv": {"name": "Mean Corpuscular Volume", "unit": "fL"},
    "mch": {"name": "Mean Corpuscular Hemoglobin", "unit": "pg"},
    "mchc": {"name": "Mean Corpuscular Hemoglobin Concentration", "unit": "g/dL"},
    "rdw": {"name": "Red Cell Distribution Width", "unit": "%"},
    "mpv": {"name": "Mean Platelet Volume", "unit": "fL"},
    # Metabolic Panel
    "glucose": {"name": "Glucose", "unit": "mg/dL"},
    "bun": {"name": "Blood Urea Nitrogen", "unit": "mg/dL"},
    "urea nitrogen": {"name": "Blood Urea Nitrogen", "unit": "mg/dL"},
    "urea": {"name": "Blood Urea Nitrogen", "unit": "mmol/L"},
    "creatinine": {"name": "Creatinine", "unit": "mg/dL"},
    "sodium": {"name": "Sodium", "unit": "mEq/L"},
    "potassium": {"name": "Potassium", "unit": "mEq/L"},
    "chloride": {"name": "Chloride", "unit": "mEq/L"},
    "co2": {"name": "Carbon Dioxide", "unit": "mEq/L"},
    "carbon dioxide": {"name": "Carbon Dioxide", "unit": "mEq/L"},
    "calcium": {"name": "Calcium", "unit": "mg/dL"},
    "total protein": {"name": "Total Protein", "unit": "g/dL"},
    "albumin": {"name": "Albumin", "unit": "g/dL"},
    "bilirubin": {"name": "Total Bilirubin", "unit": "mg/dL"},
    "total bilirubin": {"name": "Total Bilirubin", "unit": "mg/dL"},
    "alkaline phosphatase": {"name": "Alkaline Phosphatase", "unit": "U/L"},
    "alp": {"name": "Alkaline Phosphatase", "unit": "U/L"},
    "ast": {"name": "Aspartate Aminotransferase (AST)", "unit": "U/L"},
    "sgot": {"name": "Aspartate Aminotransferase (AST)", "unit": "U/L"},
    "alt": {"name": "Alanine Aminotransferase (ALT)", "unit": "U/L"},
    "sgpt": {"name": "Alanine Aminotransferase (ALT)", "unit": "U/L"},
    "gfr": {"name": "Glomerular Filtration Rate", "unit": "mL/min/1.73m2"},
    "egfr": {"name": "Estimated GFR", "unit": "mL/min/1.73m2"},
    # Lipid Panel
    "cholesterol": {"name": "Total Cholesterol", "unit": "mg/dL"},
    "total cholesterol": {"name": "Total Cholesterol", "unit": "mg/dL"},
    "triglycerides": {"name": "Triglycerides", "unit": "mg/dL"},
    "triglyceride": {"name": "Triglycerides", "unit": "mg/dL"},
    "hdl": {"name": "HDL Cholesterol", "unit": "mg/dL"},
    "hdl cholesterol": {"name": "HDL Cholesterol", "unit": "mg/dL"},
    "ldl": {"name": "LDL Cholesterol", "unit": "mg/dL"},
    "ldl cholesterol": {"name": "LDL Cholesterol", "unit": "mg/dL"},
    "vldl": {"name": "VLDL Cholesterol", "unit": "mg/dL"},
    # Thyroid
    "tsh": {"name": "Thyroid Stimulating Hormone", "unit": "mIU/L"},
    "t3": {"name": "Triiodothyronine (T3)", "unit": "ng/dL"},
    "free t3": {"name": "Free T3", "unit": "pg/mL"},
    "t4": {"name": "Thyroxine (T4)", "unit": "ug/dL"},
    "free t4": {"name": "Free T4", "unit": "ng/dL"},
    # Other common
    "a1c": {"name": "Hemoglobin A1c", "unit": "%"},
    "hemoglobin a1c": {"name": "Hemoglobin A1c", "unit": "%"},
    "hba1c": {"name": "Hemoglobin A1c", "unit": "%"},
    "iron": {"name": "Iron", "unit": "ug/dL"},
    "ferritin": {"name": "Ferritin", "unit": "ng/mL"},
    "vitamin d": {"name": "Vitamin D", "unit": "ng/mL"},
    "vitamin b12": {"name": "Vitamin B12", "unit": "pg/mL"},
    "folate": {"name": "Folate", "unit": "ng/mL"},
    "uric acid": {"name": "Uric Acid", "unit": "mg/dL"},
    "magnesium": {"name": "Magnesium", "unit": "mg/dL"},
    "phosphorus": {"name": "Phosphorus", "unit": "mg/dL"},
    # Urine tests
    "urine albumin": {"name": "Urine Albumin", "unit": "mg/L"},
    "urine creatinine": {"name": "Urine Creatinine", "unit": "mmol/L"},
    "acr": {"name": "Albumin/Creatinine Ratio", "unit": "mg Alb/mmol"},
}


def _determine_status(value: float, ref_range: str) -> ResultStatus:
    """Determine if a value is normal, abnormal, or critical based on reference range."""
    match = re.match(r"([\d.]+)\s*[-–]\s*([\d.]+)", ref_range)
    if not match:
        # Try patterns like "<100" or ">60"
        lt_match = re.match(r"[<≤]\s*([\d.]+)", ref_range)
        gt_match = re.match(r"[>≥]\s*([\d.]+)", ref_range)
        if lt_match:
            upper = float(lt_match.group(1))
            if value > upper * 1.5:
                return ResultStatus.CRITICAL
            elif value > upper:
                return ResultStatus.ABNORMAL
            return ResultStatus.NORMAL
        elif gt_match:
            lower = float(gt_match.group(1))
            if value < lower * 0.5:
                return ResultStatus.CRITICAL
            elif value < lower:
                return ResultStatus.ABNORMAL
            return ResultStatus.NORMAL
        return ResultStatus.NORMAL

    low = float(match.group(1))
    high = float(match.group(2))
    range_span = high - low

    if low <= value <= high:
        return ResultStatus.NORMAL
    elif value < low - range_span * 0.5 or value > high + range_span * 0.5:
        return ResultStatus.CRITICAL
    else:
        return ResultStatus.ABNORMAL


def _match_test_name(text: str) -> dict | None:
    """Look up a test name in KNOWN_TESTS. Returns the test info dict or None."""
    text_lower = text.lower().strip()
    # Try exact match first
    if text_lower in KNOWN_TESTS:
        return KNOWN_TESTS[text_lower]
    # Try substring match
    for key, info in KNOWN_TESTS.items():
        if key == text_lower or key in text_lower or text_lower in key:
            return info
    return None


def _extract_single_line(lines: list[str]) -> list[LabResult]:
    """Extract lab results where all info is on one line."""
    results = []
    seen_tests = set()

    patterns = [
        # Pattern 1: Name  Value  Unit  Low-High
        re.compile(
            r"^(.+?)\s{2,}(\d+\.?\d*)\s+([a-zA-Z/%^0-9.]+(?:/[a-zA-Z0-9.]+)*)\s+"
            r"(\d+\.?\d*\s*[-–]\s*\d+\.?\d*)",
            re.IGNORECASE,
        ),
        # Pattern 2: Name  Value  Low-High  Unit
        re.compile(
            r"^(.+?)\s{2,}(\d+\.?\d*)\s+(\d+\.?\d*\s*[-–]\s*\d+\.?\d*)\s+"
            r"([a-zA-Z/%^0-9.]+(?:/[a-zA-Z0-9.]+)*)",
            re.IGNORECASE,
        ),
        # Pattern 3: Name: Value Unit (Ref: Low-High)
        re.compile(
            r"^(.+?):\s*(\d+\.?\d*)\s*([a-zA-Z/%^0-9.]+(?:/[a-zA-Z0-9.]+)*)\s*"
            r"\(?(?:ref|reference|range)?:?\s*(\d+\.?\d*\s*[-–]\s*\d+\.?\d*)\)?",
            re.IGNORECASE,
        ),
    ]

    for line in lines:
        line = line.strip()
        if not line or len(line) < 5:
            continue

        for pattern in patterns:
            match = pattern.match(line)
            if match:
                groups = match.groups()
                test_name_raw = groups[0].strip().rstrip(".:,")
                value_str = groups[1]

                if pattern == patterns[1]:
                    ref_range = groups[2]
                    unit = groups[3]
                else:
                    unit = groups[2]
                    ref_range = groups[3]

                matched_test = _match_test_name(test_name_raw)
                if matched_test and matched_test["name"] not in seen_tests:
                    try:
                        value = float(value_str)
                    except ValueError:
                        continue

                    seen_tests.add(matched_test["name"])
                    status = _determine_status(value, ref_range)
                    results.append(
                        LabResult(
                            test_name=matched_test["name"],
                            value=value,
                            unit=unit if unit else matched_test["unit"],
                            reference_range=ref_range,
                            status=status,
                        )
                    )
                    break

    return results


def _extract_multi_line(lines: list[str]) -> list[LabResult]:
    """
    Extract lab results where data spans multiple lines.
    Handles formats like:
        Sodium
        钠
        141
        mmol/L
        (135-145)
    """
    results = []
    seen_tests = set()

    # Clean lines: strip whitespace, skip empty
    cleaned = [l.strip() for l in lines]

    i = 0
    while i < len(cleaned):
        line = cleaned[i]

        # Try to match this line as a known test name
        matched_test = _match_test_name(line)
        if matched_test and matched_test["name"] not in seen_tests:
            # Look ahead in the next few lines for value, unit, and reference range
            value = None
            unit = None
            ref_range = None

            # Search forward up to 8 lines for the components
            for j in range(i + 1, min(i + 9, len(cleaned))):
                fwd = cleaned[j]
                if not fwd:
                    continue

                # Check if we hit another known test name — stop looking
                if j > i + 1 and _match_test_name(fwd) and fwd[0].isascii() and fwd[0].isalpha():
                    break

                # Try to find a numeric value (e.g., "141", "5.6", "0.21")
                if value is None:
                    val_match = re.match(r"^(\d+\.?\d*)\s*(%)?$", fwd)
                    if val_match:
                        value = float(val_match.group(1))
                        if val_match.group(2):
                            unit = "%"
                        continue
                    # Handle "5.2 %" format
                    val_match = re.match(r"^(\d+\.?\d*)\s+(%|[a-zA-Z].*)$", fwd)
                    if val_match:
                        value = float(val_match.group(1))
                        unit_candidate = val_match.group(2).strip()
                        # Only accept as unit if it looks like a unit, not a test name
                        if re.match(r"^[a-zA-Z/%]", unit_candidate) and not _match_test_name(unit_candidate):
                            unit = unit_candidate
                        continue

                # Try to find unit (e.g., "mmol/L", "U/L", "mg/L")
                if unit is None and re.match(
                    r"^[a-zA-Z/%][a-zA-Z0-9/%.*^]+(?:/[a-zA-Z0-9.^]+)*$", fwd
                ) and not _match_test_name(fwd):
                    unit = fwd
                    continue

                # Try to find reference range: (135-145) or (< 41) or (3.9 - 6.0)
                range_match = re.match(
                    r"^\(?\s*(<\s*[\d.]+|[\d.]+\s*[-–]\s*[\d.]+)\s*\)?$", fwd
                )
                if range_match:
                    ref_range = range_match.group(1).strip()
                    continue

            if value is not None:
                if ref_range is None:
                    ref_range = "N/A"
                if unit is None:
                    unit = matched_test["unit"]

                seen_tests.add(matched_test["name"])
                status = _determine_status(value, ref_range)
                results.append(
                    LabResult(
                        test_name=matched_test["name"],
                        value=value,
                        unit=unit,
                        reference_range=ref_range,
                        status=status,
                    )
                )

        i += 1

    return results


def extract_lab_results(text: str) -> list[LabResult]:
    """Extract lab results from raw PDF text. Tries multiple parsing strategies."""
    lines = text.split("\n")

    # Strategy 1: Try single-line extraction
    results = _extract_single_line(lines)

    # Strategy 2: If single-line found few results, try multi-line extraction
    multi_results = _extract_multi_line(lines)

    # Use whichever strategy found more results
    if len(multi_results) > len(results):
        results = multi_results

    return results
