"""
generate_sample_pdfs.py — Creates 6 sample receipt PDFs for testing.

Requires reportlab: pip install reportlab

Usage:
    python data/generate_sample_pdfs.py
"""

from __future__ import annotations

from pathlib import Path


def main() -> None:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError:
        print("reportlab not installed. Run: pip install reportlab")
        return

    out_dir = Path(__file__).parent / "sample_receipts"
    out_dir.mkdir(parents=True, exist_ok=True)

    receipts = [
        ("hotel_marriott.pdf", _hotel_content()),
        ("taxi_ola.pdf", _taxi_content()),
        ("flight_indigo.pdf", _flight_content()),
        ("meals_restaurant.pdf", _meals_content()),
        ("meals_conference.pdf", _conference_content()),
        ("misc_pharmacy.pdf", _pharmacy_content()),
    ]

    for filename, lines in receipts:
        path = out_dir / filename
        c = canvas.Canvas(str(path), pagesize=A4)
        y = 780
        for line in lines:
            c.setFont("Helvetica-Bold" if line.startswith("**") else "Helvetica", 11)
            text = line.lstrip("*")
            c.drawString(60, y, text)
            y -= 18
            if y < 60:
                c.showPage()
                y = 780
        c.save()
        print(f"  Created: {path.name}")

    print(f"\nGenerated {len(receipts)} sample PDFs in {out_dir}")


def _hotel_content():
    # Matches CCT001: Marriott, INR 18000, 2026-07-20, EMP001
    return [
        "**MARRIOTT BENGALURU",
        "**No. 12, Vittal Mallya Road, Bengaluru 560001",
        "Tel: +91-80-2214-9000",
        "",
        "FOLIO / TAX INVOICE",
        "Invoice No : MBL-2026-00421",
        "Guest Name : Priya Sharma",
        "Room No    : 412",
        "",
        "Check-in   : 2026-07-20",
        "Check-out  : 2026-07-23",
        "No. of Nights : 3",
        "",
        "Room Charges    : INR 5,000.00 / night",
        "Room x 3 nights : INR 15,000.00",
        "GST (12%)       : INR 1,800.00",
        "Service Charge  : INR 1,200.00",
        "------------------------------",
        "TOTAL PAYABLE   : INR 18,000.00",
        "",
        "Payment Mode: Corporate Card",
        "Card last 4 digits: 4242",
    ]


def _taxi_content():
    # Matches CCT003: Ola, INR 650, 2026-07-20, EMP001
    return [
        "**OLA CABS",
        "Ride Receipt",
        "",
        "Booking ID  : OLA-BLR-20260720-88421",
        "Date        : 2026-07-20",
        "Time        : 09:35 AM",
        "",
        "Pickup  : Bengaluru Airport",
        "Drop    : Marriott Bengaluru, Vittal Mallya Road",
        "Distance: 42.0 km",
        "",
        "Base Fare   : INR 590.00",
        "Toll        : INR 40.00",
        "GST (5%)    : INR 20.00",
        "------------------------------",
        "TOTAL       : INR 650.00",
        "",
        "Payment: Corporate Card ****4242",
    ]


def _flight_content():
    # Matches CCT002: IndiGo Airlines, INR 5500, 2026-07-19, EMP001
    return [
        "**IndiGo",
        "e-Ticket / Booking Confirmation",
        "",
        "PNR            : 6E-WX842",
        "Ticket Number  : 423-1234567890",
        "Booking Date   : 2026-07-10",
        "",
        "Passenger      : SHARMA/PRIYA MS",
        "Flight         : 6E 501",
        "From           : BOM (Mumbai)",
        "To             : BLR (Bengaluru)",
        "Date           : 19 Jul 2026",
        "Departure      : 08:20",
        "Arrival        : 10:05",
        "Seat           : 14C",
        "Class          : Economy",
        "",
        "Base Fare      : INR 4,600.00",
        "Taxes & Fees   : INR 900.00",
        "------------------------------",
        "TOTAL          : INR 5,500.00",
        "",
        "Payment: Corporate Card ****4242",
    ]


def _meals_content():
    # Matches CCT004: The Fatty Bao, INR 950, 2026-07-21, EMP001
    return [
        "**THE FATTY BAO",
        "No. 5, Residency Road, Bengaluru",
        "GSTIN: 29ABCDE1234F1Z5",
        "",
        "Table : 8  |  Covers: 2",
        "Date  : 2026-07-21",
        "Time  : 8:30 PM",
        "",
        "Pork Belly Bao (2)        :  INR 480",
        "Edamame                   :  INR 220",
        "Drinks (2)                :  INR 120",
        "------------------------------",
        "Sub Total                 : INR 820",
        "GST (5%)                  :  INR  41",
        "Service Charge (10%)      :  INR  89",
        "------------------------------",
        "TOTAL                     : INR 950",
        "",
        "Payment: Corporate Card ****4242",
        "Business Purpose: Team dinner - client meeting",
    ]


def _conference_content():
    return [
        "**NASSCOM INDIA LEADERSHIP FORUM 2026",
        "Registration Receipt",
        "",
        "Delegate        : Rahul Sharma",
        "Organisation    : IBM India Pvt Ltd",
        "Event           : NASSCOM India Leadership Forum 2026",
        "Venue           : Bengaluru International Exhibition Centre",
        "Date            : 2026-07-20",
        "",
        "Registration ID : NASSCOM-2026-ILF-4521",
        "",
        "Registration Fee : INR 8,500.00",
        "GST (18%)        : INR 1,530.00",
        "------------------------------",
        "TOTAL PAID       : INR 10,030.00",
        "",
        "Payment Mode: Corporate Card ****4242",
    ]


def _pharmacy_content():
    return [
        "**WELLNESS FOREVER",
        "MG Road, Bengaluru",
        "Ph: 080-41234567",
        "",
        "CASH MEMO / TAX INVOICE",
        "Invoice No : WF-BLR-20260720-0891",
        "Date       : 2026-07-20",
        "",
        "Paracetamol 500mg x 10    : INR  28.00",
        "ORS Sachet x 5            : INR  35.00",
        "Vitamin C 500mg x 30      : INR 145.00",
        "------------------------------",
        "Sub Total                 : INR 208.00",
        "GST                       : INR  10.40",
        "TOTAL                     : INR 218.40",
        "",
        "Payment: Cash",
        "Note: Medical expenses — travel illness",
    ]


if __name__ == "__main__":
    main()
