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

const data = [
  {
    webHookURL: 'https://hook.dooray.com/services/1387695619080878080/3514751745337936891/B5oGM0RcQOOe-3J-feWCkA', // IOT
    sendDay: [1, 2, 3, 4, 5]
  },
  {
    webHookURL: 'https://hook.dooray.com/services/3234962584704058721/3553650564846119240/2Jmla0eqRg6D4nhSeXTTiw', // fashiongo
    sendDay: [1]
  },
  // {
  //   webHookURL: 'https://hook.dooray.com/services/1387695619080878080/3514718644643270309/LkaJ0WHmRqCIbixoUsYv1Q', // 개인
  //   sendDay: [1]
  // },
]
const repeatCount = 25;

main()

async function main(){
  cron.schedule('30 11 * * 1-5', async () => {
    let lunchMenuSummary = await crawl(repeatCount)
    sendDoorayMessage(lunchMenuSummary, data)
  });
}


async function crawl(count) {
  return new Promise(async (resolve) => {
    let cnt = count;
    const interval = setInterval(async () => {

      const lunchMenuSummary = await crawlFromPayco();
      const isFriday = Util.isFriday()
      // 이미지 개수가 ... 금요일에는 한개, 그외 요일은 3개
      // 월화수목 - 3개, 금 - 1개
      const imageLength = lunchMenuSummary.filter(e => e.imageUrl).length
      if(isFriday ? imageLength === 1 : imageLength === 3) { // 이미지가 뜬다면 바로 for문 탈출하고 실행
        console.log(`이미지 ${imageLength}개 있다`)
        resolve(lunchMenuSummary);
        clearInterval(interval)
      }

      cnt--;

      if(cnt === 0) {
        resolve(null)
        clearInterval(interval)
      }

    }, 60000)
  })
}

// function startCrawlCron(callback) {
//   // 프로세스 종료 시 스케쥴러도 죽도록
//   process.on('SIGINT', () => {
//       console.log('Terminating scheduledJob...');
//       scheduledJobSendMail.stop();
//       scheduledFashionGoJobSendMail.stop();
//       process.exit();
//   });

//   process.on('SIGTERM', () => {
//       console.log('Terminating scheduledJob...');
//       scheduledJobSendMail.stop();
//       scheduledFashionGoJobSendMail.stop();
//       process.exit();
//   });

//   // 월-금 오전 11시 30분에 작업을 실행합니다.
//   const scheduledJobSendMail = cron.schedule('30 11 * * 1-5', async () => {
//     repeat(repeatCount, callback)
//   });
//   // const scheduledFashionGoJobSendMail = cron.schedule('32 11 * * 1', async () => {
//   //   repeat(repeatCount, callback)
//   // });
// }


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