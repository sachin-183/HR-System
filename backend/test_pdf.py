from fpdf import FPDF

def create_offer_pdf():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(1, 40, 94) # Shellkode Navy
    pdf.cell(0, 15, "ShellKode", new_x="LMARGIN", new_y="NEXT", align="C")
    
    pdf.set_font("helvetica", "B", 16)
    pdf.set_text_color(2, 173, 239) # Shellkode Cyan
    pdf.cell(0, 10, "Official Offer of Employment", new_x="LMARGIN", new_y="NEXT", align="C")
    
    pdf.ln(10)
    pdf.set_font("helvetica", "", 12)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 8, "Dear Candidate,\n\nWe are extremely pleased to offer you the position. We believe your skills and experience are an excellent match for our company.\n\nPlease find the details of your employment in the attached documents.")
    pdf.output("test_offer.pdf")

create_offer_pdf()
print("pdf created")
