import json
import os
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait


def get_job_list(browser: webdriver.Chrome, jobs_data, last_job_link):
    browser.get("https://www.upwork.com/nx/search/jobs/?nbs=1&q=python&page=1&per_page=50")

    print(browser.page_source)
    jobs_articles = browser.find_elements(By.CLASS_NAME, "job-tile")

    print(len(jobs_articles))

    for job in jobs_articles:
        link = job.find_element(By.TAG_NAME, "a").get_attribute("href")

        # Stop scraping if we reach the last job that was previously saved
        if link == last_job_link:
            break

        job_title = job.find_element(By.CLASS_NAME, "job-tile-title")
        job_title_text = job_title.text.strip()

        job_description = job.find_element(By.CLASS_NAME, "text-body-sm").text.strip()

        job_info_table = job.find_element(By.CLASS_NAME, "job-tile-info-list")

        job_info_items = job_info_table.find_elements(By.TAG_NAME, "li")

        rate = job_info_items[0].text.strip()
        exp_lvl = job_info_items[1].text.strip()
        est_time = job_info_items[2].text.strip()

        cleaner_est_time = est_time.split('\n', 1)[-1]

        tag_list = []

        tags = job.find_elements(By.CLASS_NAME, "air3-token")

        for tag in tags[:8]:
            tag_text = tag.text.strip()
            tag_list.append(tag_text)

        job_obj = {
            "title": job_title_text,
            "description": job_description,
            "tags": tag_list,
            "rate": rate,
            "exp_lvl": exp_lvl,
            "est_time": cleaner_est_time,
            "link": link
        }

        jobs_data.append(job_obj)

    return jobs_data




def find_jobs(browser: webdriver.Chrome):
    jobs_output_file = "jobs_data.json"

    if os.path.exists(jobs_output_file):
        with open(jobs_output_file, "r") as file:
            existing_data = json.load(file)
            last_job_link = existing_data[0]["link"] if existing_data else None
    else:
        existing_data = []
        last_job_link = None

    jobs_data = []


    get_job_list(browser=browser, jobs_data=jobs_data, last_job_link=last_job_link)

    updated_data = jobs_data + existing_data

    with open(jobs_output_file, "w") as file:
        json.dump(updated_data, file, indent=4)

    print(f"Extracted data written to json")
