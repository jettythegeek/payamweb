import asyncio,sys
from playwright.async_api import async_playwright
# (html, out-name, viewport width)
JOBS=[('a-hero','01-hero',1440),('a-hero','01-hero',390),('b-form-desktop','02-form',1440),('b-form-mobile','02-form',390),
('c-success','03-success',1440),('c-success','03-success',390),('d-errors','04-errors-duplicate',1440),('d-errors','04-errors-duplicate',390),
('e-business','05-for-businesses',1440),('e-business','05-for-businesses',390)]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for h,o,w in JOBS:
            pg=await b.new_page(viewport={'width':w,'height':900 if w>400 else 844},device_scale_factor=1 if w>400 else 2)
            await pg.goto(f'file:///workspace/landing/waitlist/html/{h}.html'); await pg.wait_for_timeout(300)
            await pg.evaluate('document.fonts.ready')
            await pg.screenshot(path=f'/workspace/landing/waitlist/{o}-{"desktop" if w>400 else "mobile"}.png',full_page=True)
            await pg.close()
        await b.close()
asyncio.run(main())
