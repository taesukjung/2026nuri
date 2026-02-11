import os
from playwright.sync_api import sync_playwright

def verify_contact_form():
    # Read the original file
    with open('views/contact/contact1_write.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Modify content for static viewing
    content = content.replace('href="/css/', 'href="../../public/css/')
    content = content.replace('src="/js/', 'src="../../public/js/')
    content = content.replace('href="/summernote/', 'href="../../public/summernote/')
    content = content.replace('src="/summernote/', 'src="../../public/summernote/')
    content = content.replace('src="/images/', 'src="../../public/images/')

    # Replace EJS tags
    content = content.replace('<%=b_id%>', 'test_id')

    # Save to a temporary file
    temp_file = 'views/contact/contact1_write_test.html'
    with open(temp_file, 'w', encoding='utf-8') as f:
        f.write(content)

    file_path = os.path.abspath(temp_file)
    file_url = f'file://{file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(file_url)

        # Take a screenshot of the form area
        # We target .div_contact or .btn_area

        # Wait for potential JS to run (though without server it might error, but visual structure should be there)
        page.wait_for_timeout(1000)

        # Screenshot the button area specifically to verify changes
        btn_area = page.locator('.btn_area')
        btn_area.screenshot(path='verification_buttons.png')

        # Screenshot the whole form
        form_area = page.locator('.news_write')
        form_area.screenshot(path='verification_form.png')

        browser.close()

    # Cleanup
    if os.path.exists(temp_file):
        os.remove(temp_file)

if __name__ == "__main__":
    verify_contact_form()
