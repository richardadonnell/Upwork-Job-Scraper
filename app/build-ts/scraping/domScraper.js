// This file is executed as a function inside the page via chrome.scripting.executeScript
// It must be serializable and not import external modules.
function isLoggedOut() {
    const markers = ['a[href*="/login"]', 'button[data-qa="login-button"]', '.logout', 'a[href*="/sign-up"]'];
    return markers.some((sel) => !!document.querySelector(sel));
}
function extractJobsFromDom() {
    const jobs = [];
    const jobEls = document.querySelectorAll('[data-test="job-tile-list"] article');
    jobEls.forEach((el) => {
        const title = (el.querySelector('h4')?.textContent || '').trim();
        const url = el.querySelector('a')?.href || '';
        const desc = (el.querySelector('[data-test="job-description-text"]')?.textContent || '').trim();
        jobs.push({ title, url, desc });
    });
    return jobs;
}
// expose as global for injection
;
window.__upworkScrape = function () {
    if (isLoggedOut())
        return { ok: false, reason: 'logged_out' };
    try {
        const jobs = extractJobsFromDom();
        return { ok: true, jobs };
    }
    catch (err) {
        return { ok: false, reason: 'error', error: String(err) };
    }
};
export {};
