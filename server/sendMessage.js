
const axios = require('axios')
const Util = require('./util')

const data = {
    botName: '',
    botIconImage: 'https://static.dooray.com/static_images/dooray-bot.png',
    text: ''
}


function sendDoorayMessage(todayMenu, sendTargetArray) {
    data.attachments = todayMenu
    data.botName = `${Util.getDayOfWeek(new Date())}요일 ${Util.getMealTimeText()} 메뉴`
    sendTargetArray.forEach(sendTarget => {
        let webHookURL = sendTarget.webHookURL
        let day = Util.getDay() 
        let decideSent = sendTarget.sendDay.includes(day)
    
        if(!decideSent) return

        axios.post(webHookURL, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            console.log(`웹훅 전송 성공: ${response.status}`);
        }).catch((error) => {
            console.error(`웹훅 전송 실패: ${error.message}`);
        });
    })
}

exports.sendDoorayMessage = sendDoorayMessage