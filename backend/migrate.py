import sqlite3

try:
    conn = sqlite3.connect('hr_system.db')
    cursor = conn.cursor()
    
    cursor.execute('ALTER TABLE candidates ADD COLUMN onboarding_password VARCHAR;')
    print('Added onboarding_password to candidates')
except Exception as e:
    print('Error on password column:', e)

try:
    cursor.execute("ALTER TABLE candidates ADD COLUMN onboarding_status VARCHAR DEFAULT 'Pending';")
    print('Added onboarding_status to candidates')
except Exception as e:
    print('Error on status column:', e)

conn.commit()
conn.close()
print("Migration completed.")
