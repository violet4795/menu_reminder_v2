const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const request = require('request');
// const { mergeImaged } = require('./merge.js')


async function crawlFromPayco() {

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ],
    });
    const page = await browser.newPage();

    // whatsup 페이지로 
    // console.log(process.env.PAYCO_MEAL_MENU_URL)
    await page.goto(process.env.PAYCO_MEAL_MENU_URL);
    // page.screenshot({path: 'menu.png'});

    // debugger
    const content = await page.content();
    const $ = cheerio.load(content);


    const lunchMenuList = $('#dataResult > ul > li.timeView_49')


    //lunch
    //('#dataResult > ul > li.timeView_49')
    
    //dinner
    //('#dataResult > ul > li.timeView_50')


    const lunchArr = lunchMenuList.toArray()
    const lunchMenuSummary = lunchArr.map(e => {
        const lunch = $(e)
        const lunchTitle = lunch.find('.menu_title').text()
        const lunchText = lunch.find('.menu_info_box').text().replace(/\s*>\s*/g, '>').replace(/\s*Kcal/g,'Kcal').replace(/\s+/g, ' \n').trim()
        const lunchImage = lunch.find('img').attr('src')
        return {
            title: lunchTitle,
            text: lunchText,
            imageUrl: lunchImage
        }
    })

    
    await browser.close();

    return lunchMenuSummary;
}

exports.crawlFromPayco = crawlFromPayco