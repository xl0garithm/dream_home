const puppeteer = require('puppeteer');
const fileHandler = require('./fileHandler');

const HGTV_URL = 'https://www.hgtv.com/sweepstakes/hgtv-dream-home/sweepstakes';
const FOOD_URL = 'https://www.foodnetwork.com/sponsored/sweepstakes/hgtv-dream-home-sweepstakes';


// Date Stuff
let ts = Date.now();

let date_ob = new Date(ts);
let date = date_ob.getDate();
let month = date_ob.getMonth();
let year = date_ob.getFullYear();
let minutes = date_ob.getMinutes();
let hours = date_ob.getHours();

console.log("Timestamp: " + (month + 1) + "/" + date + "/" + year + " " + hours + ":" + minutes);
console.log("\n\n===================================================== \n\
HGTV Dream Home Submission Automation - Logan Carlson \n\
===================================================== \n");
(async () => {
    // Initialize the browser
    let browser;
    try {
        console.log("Opening the browser...");
        browser = await initializeBrowser();
    } catch (err){
        console.log("Could not create a browser instance => : ", err);
    }
    let page = await browser.newPage();
    // URL to visit
    
    const emails = await fileHandler.handleFile();

    await submitFormsByEmail(page, emails);
    browser.close();
})();

async function checkSuccess(iframeContent){
    console.log("Check Success");
    const opacity = await iframeContent.evaluate(() => {
        const element = document.getElementById("xSectionEntry_xModule");
        return window.getComputedStyle(element).getPropertyValue("opacity");
    });

    if(opacity === "1"){
        console.log("Failed");
        return false;
    }
    console.log(`Success, Opacity: ${opacity}`);
    return true;
}

async function submitFormsByEmail(page, emails){
    console.log(`Emails: ${emails}`);
    for(let i = 0; i < emails.length; i++){
        await submitForm(page, HGTV_URL, emails[i]);
        await submitForm(page, FOOD_URL, emails[i]);
    }
}

async function initializeBrowser() {
    return await puppeteer.launch({
        headless: true,
        //executablePath: "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary", // default is true
        defaultViewport: null,
        devtools: true,
        ignoreHTTPSErrors: true,
	args: ['--no-sandbox'],
    });
}

async function submitForm(page, url, email){
    let iframeContent;
    page = await interactPage(page, url);

    iframeContent = await getIFrameContent(page);

    console.log(`First Form: ${email}`);
    await interactFirstForm(iframeContent, email);
    await page.waitForTimeout(2000);

    let success = await checkSuccess(iframeContent);

    if(success !== false){
        console.log(`Second Form: ${email}`);
        await interactSecondForm(iframeContent);
    }
    await page.waitForTimeout(2000);
}

async function interactPage(page, URL){
    await page.goto(URL);
    await page.waitForTimeout(2000);

    return page;
}

async function getIFrameContent(page){
    let sweepstakes_iframe = await page.$("[id^='ngxFrame']"); //230599
    let iframeContent = await sweepstakes_iframe.contentFrame();

    return iframeContent;
}

async function interactFirstForm(iframeContent, email) {

    let button = await iframeContent.$('#xCheckUser');
    await iframeContent.type('#xReturningUserEmail', email);
    await iframeContent.waitForTimeout(2000);

    await button.click();
}

async function interactSecondForm(iframeContent) {
    await iframeContent.waitForTimeout(5000);
    const formId = 'xSecondaryForm';
    await iframeContent.evaluate((formId) => {
        const form = document.getElementById(formId);
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.click();
    }, formId);
}

