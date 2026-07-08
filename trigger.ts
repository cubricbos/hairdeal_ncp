import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // No, I cannot use puppeteer without setting it up and logging in as admin. It's too complex.
  await browser.close();
})();
