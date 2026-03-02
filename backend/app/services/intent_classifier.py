# backend/app/services/intent_classifier.py

def classify_intent(text: str) -> str:
    """
    Classify ENGLISH text into ONE top-level category.
    Always returns a valid category.
    """

    q = text.lower()

    # ---------------- ACADEMICS ----------------
    if any(k in q for k in [
        "course", "syllabus", "curriculum", "sgpa", "cgpa",
        "marks", "result", "exam", "timetable", "schedule",
        "hall ticket", "regulation", "credit"
    ]):
        return "ACADEMICS"

    # ---------------- ADMISSIONS ----------------
    if any(k in q for k in [
        "admission", "apply", "eligibility", "cutoff",
        "entrance", "join", "registration"
    ]):
        return "ADMISSIONS"

    # ---------------- FINANCE & SCHOLARSHIPS ----------------
    if any(k in q for k in [
        "fee", "fees", "tuition", "payment", "scholarship",
        "refund", "finance", "accounts", "hostel fee"
    ]):
        return "FINANCE_SCHOLARSHIPS"

    # ---------------- HOSTEL & STUDENT SERVICES ----------------
    if any(k in q for k in [
        "hostel", "warden", "room", "mess",
        "transport", "bus", "counseling", "welfare"
    ]):
        return "HOSTEL_STUDENT_SERVICES"

    # ---------------- LIBRARY & IT ----------------
    if any(k in q for k in [
        "library", "book", "issue", "return",
        "fine", "wifi", "portal", "login",
        "it support", "technical"
    ]):
        return "LIBRARY_IT"

    # ---------------- PLACEMENTS & CAREER ----------------
    if any(k in q for k in [
        "placement", "company", "recruitment",
        "career", "training", "internship", "job"
    ]):
        return "PLACEMENTS_CAREER"

    # ---------------- EVENTS & ACTIVITIES ----------------
    if any(k in q for k in [
        "event", "workshop", "seminar",
        "fest", "flash mob", "cultural", "program"
    ]):
        return "EVENTS_ACTIVITIES"

    # ---------------- CONTACTS & ADMIN ----------------
    if any(k in q for k in [
        "contact", "phone", "email", "office",
        "administration", "admin", "helpdesk"
    ]):
        return "CONTACTS_ADMINISTRATION"

    # ---------------- FALLBACK ----------------
    return "OTHER"
