const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { crawlFromPayco } = require('./crawl.js');
const { sendDoorayMessage } = require('./sendMessage')
const Util = require('./util.js');
const cron = require('node-cron');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
 
// const weebHookURL = 'https://hook.dooray.com/services/1387695619080878080/3514718644643270309/LkaJ0WHmRqCIbixoUsYv1Q'
const weebHookURL = 'https://hook.dooray.com/services/1387695619080878080/3514751745337936891/B5oGM0RcQOOe-3J-feWCkA'
const repeatCount = 20;
main()

async function main(){

  //브라우저 키고 끄고 하는게 더 낫지않을까??
  // 1. 1분에 한번씩 크롤링을 한다.
  // 2. 크롤링 결과에 이미지가 있을때까지 반복한다.
  // 3. 이미지가 있다면 메세지 보낸다.
  // startDayCron(() => )
  startCrawlCron((todayMenu) => sendDoorayMessage(todayMenu, weebHookURL))

  // // 월-금 오전 11시 30분에 작업을 실행합니다.
  // const scheduledJobSendMail = cron.schedule('30 11 * * 1-5', () => {
  //   const meal = Util.getMealTimeText() // 점심 or 저녁
  //   const todayMenu = Util.mealFilter(weekMenu, meal)
  //   const textTodayMenu = Util.menuToText(todayMenu)

  //   sendDoorayMessage(textTodayMenu, weebHookURL)
  // });


}


async function repeat(count, callback) {
  const lunchMenuSummary = await crawlFromPayco();
  console.log(lunchMenuSummary)
  if(Util.isExistImage(lunchMenuSummary)) { // 이미지가 뜬다면 바로 for문 탈출하고 실행

    console.log('이미지 있다')
    callback(lunchMenuSummary)
    return;
  }
  setTimeout(() => repeat(count-1, callback), 60000)
}

function startCrawlCron(callback) {
  // 프로세스 종료 시 스케쥴러도 죽도록
  process.on('SIGINT', () => {
      console.log('Terminating scheduledJob...');
      scheduledJobSendMail.stop();
      process.exit();
  });

  process.on('SIGTERM', () => {
      console.log('Terminating scheduledJob...');
      scheduledJobSendMail.stop();
      process.exit();
  });

  // 월-금 오전 11시 30분에 작업을 실행합니다.
  const scheduledJobSendMail = cron.schedule('30 11 * * 1-5', async () => {
    repeat(repeatCount, callback)
  });

  

  // const scheduledJobSendMail = cron.schedule('*/1 11:30-11:59 * * 1-5', async () => {
  //   let lunchMenuText = await crawlFromPayco();
  //   let weebHookURL = 'https://hook.dooray.com/services/1387695619080878080/3514718644643270309/LkaJ0WHmRqCIbixoUsYv1Q'
  //   callback()
  // });

}


app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
 
      if (pathname === '/a') {
        await app.render(req, res, '/a', query);
      } else if (pathname === '/b') {
        await app.render(req, res, '/b', query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});