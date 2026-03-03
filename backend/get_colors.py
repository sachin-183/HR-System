import urllib.request
import re
from collections import Counter
from bs4 import BeautifulSoup

try:
    req = urllib.request.Request('https://www.shellkode.com/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')

    # find style tags
    styles = soup.find_all('style')
    color_matches = []
    
    # regex for hex colors
    hex_pattern = re.compile(r'#(?:[0-9a-fA-F]{3}){1,2}')
    for style in styles:
        color_matches.extend(hex_pattern.findall(style.text))
        
    # Get inline styles too
    for tag in soup.find_all(style=True):
        color_matches.extend(hex_pattern.findall(tag['style']))

    # Also extract colors from classes like text-[#FF4500] if any
    for el in soup.find_all(class_=True):
        classes = " ".join(el['class'])
        color_matches.extend(hex_pattern.findall(classes))
    
    print("Most common colors:", Counter(color_matches).most_common(20))
except Exception as e:
    print("Error:", e)
