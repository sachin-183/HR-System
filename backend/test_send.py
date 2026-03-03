import email_utils

try:
    pdf_bytes = email_utils.generate_shellkode_offer_pdf("Test User", "Test Job")
    print(f"Generated PDF of type {type(pdf_bytes)} and size {len(pdf_bytes)} bytes.")
    
    email_utils.send_email(
        to_email="test@example.com", 
        subject="Test PDF Email", 
        message_body=email_utils.create_offer_letter_text("Test User", "Test Job"),
        attachment=bytes(pdf_bytes),
        attachment_name="ShellKode_Offer_Test_User.pdf"
    )
    print("Test passed without server errors.")
except Exception as e:
    print(f"Test failed with error: {e}")
