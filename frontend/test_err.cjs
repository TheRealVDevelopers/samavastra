const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('BROWSER PAGE ERROR:', error.message);
    });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Navigation complete.');

    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
