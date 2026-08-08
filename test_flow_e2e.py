import sys, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5050"
console_errors = []
page_errors = []
failed_requests = []

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("requestfailed", lambda req: print("REQ FAILED:", req.url, req.failure))
        page.on("response", lambda r: print("403:", r.url) if r.status == 403 else None)
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))
        page.on("response", lambda r: failed_requests.append((r.status, r.url)) if r.status >= 400 and "/api/" in r.url and "does-not-exist" not in r.url else None)

        def snap(name):
            page.screenshot(path=f"/tmp/shot_{name}.png")

        print("1. Load app root -> should redirect to login")
        page.goto(f"{BASE}/", wait_until="networkidle")
        time.sleep(0.5)
        print("   URL:", page.url)
        assert "login" in page.url, "Did not redirect to login"
        snap("01_login")

        print("2. Demo login")
        page.click("text=Try instant demo login")
        page.wait_for_url("**/dashboard**", timeout=8000)
        time.sleep(0.8)
        print("   URL after demo login:", page.url)
        snap("02_dashboard")

        print("3. Dashboard shows Green Score")
        assert page.locator("text=Green Score").count() > 0
        snap("03_dashboard_detail")

        print("4. Navigate to Challenges page")
        page.click("nav >> text=Challenges")
        page.wait_for_url("**/challenges**")
        time.sleep(0.6)
        snap("04_challenges")

        print("5. Complete a challenge")
        complete_btn = page.locator("button:has-text('Complete challenge')").first
        complete_btn.click()
        time.sleep(1.2)
        snap("05_after_complete")
        completed_count = page.locator("button:has-text('Completed')").count()
        print("   Completed buttons visible:", completed_count)
        assert completed_count > 0, "Challenge did not show as completed"

        print("6. Refresh persistence check")
        page.reload(wait_until="networkidle")
        time.sleep(0.8)
        print("   URL after refresh:", page.url)
        assert "login" not in page.url, "Lost session on refresh!"
        completed_after_refresh = page.locator("button:has-text('Completed')").count()
        print("   Completed buttons after refresh:", completed_after_refresh)
        assert completed_after_refresh > 0, "Completion state lost on refresh!"
        snap("06_after_refresh")

        print("7. Navigate to Analytics (carbon calculator)")
        page.click("nav >> text=Analytics")
        page.wait_for_url("**/analytics**")
        time.sleep(0.6)
        snap("07_analytics")

        print("8. Log a carbon activity")
        page.select_option("select >> nth=0", "transport")
        page.fill("input[type=number]", "12")
        page.click("button:has-text('Log activity')")
        time.sleep(1)
        snap("08_after_log")

        print("9. Navigate to Campus League")
        page.click("nav >> text=Campus League")
        page.wait_for_url("**/campus-league**")
        time.sleep(0.6)
        snap("09_campus_league")

        print("10. Navigate to Recycling Guide + search")
        page.click("nav >> text=Recycling Guide")
        page.wait_for_url("**/recycling**")
        time.sleep(0.4)
        page.fill("input[placeholder*='Search']", "phone")
        time.sleep(0.6)
        snap("10_recycling_search")

        print("11. Navigate to Eco Tips")
        page.click("nav >> text=Eco Tips")
        page.wait_for_url("**/eco-tips**")
        time.sleep(0.5)
        snap("11_eco_tips")

        print("12. Navigate to Achievements")
        page.click("nav >> text=Achievements")
        page.wait_for_url("**/achievements**")
        time.sleep(0.5)
        badge_earned = page.locator("text=Earned").count()
        print("   Badges shown as earned:", badge_earned)
        snap("12_achievements")

        print("13. Navigate to Profile")
        page.click("nav >> text=Profile")
        page.wait_for_url("**/profile**")
        time.sleep(0.5)
        snap("13_profile")

        print("14. Broken route -> 404 page")
        page.goto(f"{BASE}/#/this-route-does-not-exist", wait_until="networkidle")
        time.sleep(0.5)
        assert page.locator("text=Page not found").count() > 0, "404 page did not render"
        snap("14_404")

        print("15. Logout")
        page.goto(f"{BASE}/#/dashboard", wait_until="networkidle")
        time.sleep(0.4)
        page.click("text=Logout")
        time.sleep(0.5)
        print("   URL after logout:", page.url)
        assert "login" in page.url, "Did not return to login after logout"
        snap("15_after_logout")

        print("16. Mobile viewport check")
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(f"{BASE}/#/login", wait_until="networkidle")
        time.sleep(0.5)
        snap("16_mobile_login")
        page.click("text=Try instant demo login")
        page.wait_for_url("**/dashboard**", timeout=8000)
        time.sleep(0.6)
        snap("17_mobile_dashboard")
        page.click("button[aria-label='Open menu']")
        time.sleep(0.4)
        snap("18_mobile_nav_open")

        browser.close()

    print("\n=== RESULTS ===")
    print("Console errors:", len(console_errors))
    for e in console_errors:
        print("  -", e)
    print("Page errors:", len(page_errors))
    for e in page_errors:
        print("  -", e)
    print("Failed API requests:", len(failed_requests))
    for status, url in failed_requests:
        print("  -", status, url)

    if console_errors or page_errors or failed_requests:
        sys.exit(1)
    print("\nALL CHECKS PASSED, NO CONSOLE/PAGE/API ERRORS")

run()
