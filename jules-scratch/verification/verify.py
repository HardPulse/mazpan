from playwright.sync_api import Page, expect

def test_screenshot(page: Page):
    page.goto("http://localhost:3007")
    expect(page).to_have_title("Gyat Panel")
    page.screenshot(path="jules-scratch/verification/screenshot.png")
