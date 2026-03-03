import requests
import re
from collections import Counter
from bs4 import BeautifulSoup
import urllib.parse

try:
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    html = requests.get('https://www.shellkode.com/', headers=headers).text
    soup = BeautifulSoup(html, 'html.parser')
    
    color_matches = []
    hex_pattern = re.compile(r'#(?:[0-9a-fA-F]{3}){1,2}\b')
    
    # scan HTML directly for hex
    color_matches.extend(hex_pattern.findall(html))
    
    links = soup.find_all('link', rel='stylesheet')
    for link in links:
        href = link.get('href')
        if href:
            css_url = urllib.parse.urljoin('https://www.shellkode.com/', href)
            css_text = requests.get(css_url, headers=headers).text
            color_matches.extend(hex_pattern.findall(css_text))

    print("Colors found:")
    for c, count in Counter(color_matches).most_common(20):
        print(f"{c}: {count}")

except Exception as e:
    print("Error:", e)
