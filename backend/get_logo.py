import requests
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM

def download_and_convert_logo():
    # URL of the ShellKode logo we found earlier
    url = "https://cdn.prod.website-files.com/6463ba8ccedb67708a02873b/68c1841e55918330febc720c_67d7e7c7f12d2942bb92b1c9_Light%20Highres%20ShellKode%20Logo.svg"
    
    res = requests.get(url)
    with open("temp_logo.svg", "wb") as f:
        f.write(res.content)
        
    try:
        drawing = svg2rlg("temp_logo.svg")
        renderPM.drawToFile(drawing, "shellkode_logo.png", fmt="PNG")
        print("Success! Created shellkode_logo.png")
    except Exception as e:
        print("Error converting:", e)

if __name__ == "__main__":
    download_and_convert_logo()
