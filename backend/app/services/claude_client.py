import os

import anthropic

from app.models.schemas import LabResult

client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic:
    global client
    if client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        client = anthropic.Anthropic(api_key=api_key)
    return client


def generate_explanations(
    lab_results: list[LabResult], medical_context: str
) -> tuple[list[str], str]:
    """
    Send lab results + RAG context to Claude and get plain-English explanations.
    Returns (list of explanations per result, overall summary).
    """
    results_text = "\n".join(
        f"- {r.test_name}: {r.value} {r.unit} (Reference: {r.reference_range}, "
        f"Status: {r.status.value})"
        for r in lab_results
    )

    test_names = [r.test_name for r in lab_results]

    prompt = f"""You are a helpful medical lab result interpreter. You explain lab results in plain, easy-to-understand English for patients.

Here are the patient's lab results:

{results_text}

Here is relevant medical reference information:

{medical_context}

Please provide:

1. For EACH lab result listed above, provide a brief explanation (2-3 sentences) that:
   - Explains what this test measures in simple language
   - Interprets what the patient's specific value means
   - If abnormal or critical, explains potential significance

   Format each explanation as:
   TEST_NAME: [explanation]

2. After all individual explanations, provide an OVERALL SUMMARY (3-5 sentences) that gives the patient a general picture of their results. Mention which results are normal and which need attention.

Important:
- Use simple, non-technical language a patient can understand
- Be factual but not alarming
- Do NOT provide specific medical advice or treatment recommendations
- Do NOT diagnose conditions
- Remind that a healthcare provider should review these results"""

    claude = get_client()
    response = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = response.content[0].text

    # Parse the response to extract individual explanations and summary
    explanations = []
    summary = ""

    lines = response_text.split("\n")
    current_section = "explanations"
    current_explanation = ""
    summary_lines = []

    for line in lines:
        line_stripped = line.strip()

        # Check if we've hit the overall summary section
        if "OVERALL SUMMARY" in line_stripped.upper() or "SUMMARY" in line_stripped.upper() and current_section == "explanations":
            if current_explanation:
                explanations.append(current_explanation.strip())
                current_explanation = ""
            current_section = "summary"
            continue

        if current_section == "explanations":
            # Check if this line starts a new test explanation
            is_new_test = False
            for name in test_names:
                if line_stripped.upper().startswith(name.upper() + ":") or \
                   line_stripped.upper().startswith("**" + name.upper()):
                    if current_explanation:
                        explanations.append(current_explanation.strip())
                    # Extract the explanation part after the test name
                    colon_pos = line_stripped.find(":")
                    if colon_pos != -1:
                        current_explanation = line_stripped[colon_pos + 1:].strip()
                    else:
                        current_explanation = line_stripped
                    # Remove markdown bold markers
                    current_explanation = current_explanation.replace("**", "").strip()
                    is_new_test = True
                    break

            if not is_new_test and current_explanation and line_stripped:
                current_explanation += " " + line_stripped.replace("**", "")
        else:
            if line_stripped:
                summary_lines.append(line_stripped.replace("**", ""))

    # Don't forget the last explanation
    if current_explanation:
        explanations.append(current_explanation.strip())

    summary = " ".join(summary_lines).strip()

    # If parsing didn't work well, use the full response as summary
    if not summary:
        summary = response_text.strip()

    # Pad or trim explanations to match the number of results
    while len(explanations) < len(lab_results):
        explanations.append("Explanation not available for this test.")
    explanations = explanations[: len(lab_results)]

    return explanations, summary
