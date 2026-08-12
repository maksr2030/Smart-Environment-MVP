import os
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

SITE_URL = os.environ.get("SITE_URL", "https://maksr2030.github.io/Smart-Environment-MVP/")


def same_origin(url):
    expected = urlparse(SITE_URL)
    actual = urlparse(url)
    return expected.scheme == actual.scheme and expected.netloc == actual.netloc


def main():
    failed = []
    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})

        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("response", lambda response: failed.append((response.status, response.url)) if same_origin(response.url) and response.status >= 400 else None)

        page.goto(SITE_URL, wait_until="networkidle", timeout=120000)
        page.wait_for_url("**/command/", timeout=30000)
        page.wait_for_selector("#commandStatus", timeout=30000)
        page.wait_for_function("document.querySelector('#commandStatus')?.textContent.includes('جاهز')", timeout=30000)
        assert page.locator("#commandRecordCount").inner_text().strip() not in {"", "--", "٠"}
        assert page.locator("#commandCapabilityCount").inner_text().strip() not in {"", "--", "٠"}
        assert page.locator("#commandMissionCount").inner_text().strip() not in {"", "--", "٠"}

        page.locator('a[href="../app/"]').first.click()
        page.wait_for_url("**/app/", timeout=30000)
        page.wait_for_function("document.querySelector('#catalogStatus')?.textContent.includes('جاهز')", timeout=60000)

        page.locator('[data-view="capabilities"]').click()
        page.wait_for_function("document.querySelector('#capabilityStatus')?.textContent.includes('جاهز')", timeout=60000)
        assert page.locator("#capabilityGrid .capability-card").count() >= 12

        page.locator('[data-view="missions"]').click()
        page.wait_for_function("document.querySelector('#missionStatus')?.textContent.includes('جاهز')", timeout=30000)
        page.locator("#runMission").click()
        page.wait_for_selector(".mission-risk-card strong", timeout=30000)
        assert page.locator(".mission-risk-card strong").inner_text().strip()

        browser.close()

    relevant_failures = [(status, url) for status, url in failed if any(token in url for token in [".json", ".js", ".css", "/app/", "/command/"])]
    if relevant_failures:
        raise AssertionError(f"Live site resource failures: {relevant_failures}")
    if console_errors:
        raise AssertionError(f"Browser console errors: {console_errors}")

    print(f"PASS live browser smoke test: {SITE_URL}")


if __name__ == "__main__":
    main()
