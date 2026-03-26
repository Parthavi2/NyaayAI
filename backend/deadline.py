import re

def extract_deadlines(text):

    dates = re.findall(r'\d{1,2}/\d{1,2}/\d{2,4}', text)

    return dates