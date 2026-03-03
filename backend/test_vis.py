import os
from dotenv import load_dotenv
load_dotenv()
from sarvamai import SarvamAI
client = SarvamAI(api_subscription_key=os.getenv('SARVAM_API_KEY'))
job = client.document_intelligence.create_job()
open('test.png','wb').write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x00\x00\x02\x00\x01\xe2!\xbc3\x00\x00\x00\x00IEND\xaeB\x82')
job.upload_file('test.png')
job.start()
job.wait_until_complete()
job.download_output('out.zip')
print('done')
