from selenium import webdriver
from job_feed import find_jobs
from selenium_stealth import stealth
import json
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get webhook URL from .env file
webhook_url = os.getenv('WEBHOOK_URL')

options = webdriver.ChromeOptions()
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--disable-extensions")
options.add_argument('--no-sandbox')
browser = webdriver.Chrome(options=options)

stealth(browser,
        languages=["en-US", "en"],
        vendor="Google Inc.",
        platform="Win32",
        webgl_vendor="Intel Inc.",
        renderer="Intel Iris OpenGL Engine",
        fix_hairline=True,
        )

# Find jobs and save to JSON file
find_jobs(browser=browser)

# Read JSON file
with open('jobs_data.json', 'r') as file:
    data = json.load(file)

# Send data to webhook as a single array
response = requests.post(webhook_url, json={"jobs": data})

if response.status_code == 200:
    print("Data successfully sent to webhook")
else:
    print(f"Failed to send data. Status code: {response.status_code}")

# Close the browser
browser.quit()