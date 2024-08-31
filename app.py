import cfscrape
import logging
from bs4 import BeautifulSoup
import time
import random
import json

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
]

def load_cookies(cookie_file):
    with open(cookie_file, 'r') as f:
        return json.load(f)

def get_headers():
    return {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.upwork.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }

def scrape_url(url, cookies):
    scraper = cfscrape.create_scraper()
    try:
        logger.debug(f"Sending GET request to {url}")
        headers = get_headers()
        logger.debug(f"Using headers: {headers}")
        
        # Add cookies to the scraper session
        for cookie in cookies:
            scraper.cookies.set(cookie['name'], cookie['value'], domain=cookie['domain'])
        
        # Add a delay before making the request
        delay = random.uniform(2, 5)
        logger.debug(f"Waiting for {delay:.2f} seconds before request")
        time.sleep(delay)
        
        response = scraper.get(url, headers=headers)
        logger.debug(f"Response status code: {response.status_code}")
        return response.text
    except Exception as e:
        logger.error(f"Failed to scrape URL: {str(e)}")
        return None

def parse_job_listings(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    job_listings = soup.find_all('section', class_='up-card-section up-card-list-section up-card-hover')
    
    parsed_jobs = []
    for job in job_listings:
        title = job.find('a', class_='up-n-link').text.strip() if job.find('a', class_='up-n-link') else 'N/A'
        description = job.find('span', class_='js-description-text').text.strip() if job.find('span', class_='js-description-text') else 'N/A'
        budget = job.find('span', class_='js-budget').text.strip() if job.find('span', class_='js-budget') else 'N/A'
        
        parsed_jobs.append({
            'title': title,
            'description': description,
            'budget': budget
        })
    
    return parsed_jobs

def main():
    cookie_file = 'cookies.json'
    target_url = 'https://www.upwork.com/nx/find-work/most-recent'
    
    cookies = load_cookies(cookie_file)
    scraped_content = scrape_url(target_url, cookies)
    if scraped_content:
        job_listings = parse_job_listings(scraped_content)
        print(f"Found {len(job_listings)} job listings:")
        for i, job in enumerate(job_listings, 1):
            print(f"\nJob {i}:")
            print(f"Title: {job['title']}")
            print(f"Description: {job['description'][:100]}...")
            print(f"Budget: {job['budget']}")
    else:
        print("Failed to scrape the page")

if __name__ == '__main__':
    main()
