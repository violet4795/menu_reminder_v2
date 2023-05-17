const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { resolve } = require('path');

async function mergeImaged(imageUrlList, canvasWidth, canvasHeight) {
    // canvas 요소 생성
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    let idx = 0;
    for(let imageUrl of imageUrlList) {
        const image = await loadImage(imageUrl)
        console.log(image, image.width, image.height)
        ctx.drawImage(image, 0, idx*200, 300, 200);
        idx++
    }

    const stream = canvas.createPNGStream();
    const out = fs.createWriteStream('temp/merged.png')

    
    //여기까지했으면 다

    stream.pipe(out);


}

exports.mergeImaged = mergeImaged