import asyncio
from playwright.async_api import async_playwright
JOBS=[('f-admin-login','06-admin-login'),('f-admin-empty','06-admin-empty'),('f-admin-populated','06-admin-populated'),('f-admin-delete','06-admin-delete'),('g-footer','07-footer')]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for h,o in JOBS:
            for w in (1440,390):
                pg=await b.new_page(viewport={'width':w,'height':900 if w>400 else 844},device_scale_factor=1 if w>400 else 2)
                await pg.goto(f'file:///workspace/landing/waitlist/html/{h}.html'); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(200)
                await pg.screenshot(path=f'/workspace/landing/waitlist/{o}-{"desktop" if w>400 else "mobile"}.png',full_page=(h!='f-admin-delete'))
                await pg.close()
        await b.close()
asyncio.run(main())
