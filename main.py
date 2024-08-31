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

# Read current JSON file
with open('jobs_data.json', 'r') as file:
    current_data = json.load(file)

# Read previously sent jobs
try:
    with open('last_sent_jobs.json', 'r') as file:
        last_sent_data = json.load(file)
except FileNotFoundError:
    last_sent_data = []

# Find new jobs
new_jobs = [job for job in current_data if job not in last_sent_data]

if new_jobs:
    # Send only new jobs to webhook
    response = requests.post(webhook_url, json={"jobs": new_jobs})

    if response.status_code == 200:
        print(f"Successfully sent {len(new_jobs)} new jobs to webhook")
        # Update last sent jobs
        with open('last_sent_jobs.json', 'w') as file:
            json.dump(current_data, file)
    else:
        print(f"Failed to send data. Status code: {response.status_code}")
else:
    print("No new jobs to send")

# Close the browser
browser.quit()