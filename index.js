const puppeteer = require('puppeteer');
const { getRandomInt } = require('./src/math');
const { getOwnPropertyNames } = require('./src/ojbect');
const { log, error, emulatorLog } = require('./src/lib');
const { isLandscape } = require('./static/statics.json').isLandscape;

//const targetUrls = ['changbaebang.github.io'];
//const duplication = 5000;
const duplication = 1;
const targetUrls = Array.from({length: duplication}, () => 'changbaebang.github.io');


const buildEmulatorGetter = (_puppeteer) => {
  const puppeteer = _puppeteer;
  const deviceNames = getOwnPropertyNames(puppeteer.devices);

  return (isLandscape) => {
    const selected = getRandomInt(0, deviceNames.length);
    const selectedDeviceName= deviceNames[selected];
    const _emulateDevice = puppeteer.devices[selectedDeviceName];
    const _isLandscape = isLandscape;
  
    // set as landscape
    const shouldRotated = _isLandscape === true ? _emulateDevice.viewport.width > _emulateDevice.viewport.height : _emulateDevice.viewport.width < _emulateDevice.viewport.height;

    let result;
    if(shouldRotated === true) {
      result = {
        ..._emulateDevice,
        viewport: {
          ..._emulateDevice.viewport,
          isLandscape: !_emulateDevice.viewport.isLandscape,
          width: _emulateDevice.viewport.height,
          height: _emulateDevice.viewport.width,
        }
      }
    } else {
      result = _emulateDevice;
    }
  emulatorLog(`EMULATOR `)
  emulatorLog(`\t selectedDeviceName : ${selectedDeviceName}`);
  emulatorLog(`\t Landscape : ${_isLandscape}`);
  emulatorLog(`\t shouldRotated : ${shouldRotated}`);
  emulatorLog(`\t ${JSON.stringify(result)}`);
  return result;
  }
}
const getEmulator = buildEmulatorGetter(puppeteer);




(async () => {
  const browser = await puppeteer.launch();
  
  // 망한다..
  // const targetResutl = await targetUrls.map(async (url) => {
  //   await page.goto('https://' + url);
  //   await page.screenshot({ path: url + '.png' });
  //   return url + '.png';
  // });
  
  for(url in targetUrls) {
    const emulateDevice = getEmulator(isLandscape);

    log(`doing with ${url}`);
    
    const page = await browser.newPage();
    await page.emulate(emulateDevice);
    await page.goto('https://' + targetUrls[url], {
      waitUntil: 'networkidle2'
    });


    // await page.mouse.wheel({
    //   deltaY: 300
    // });

    // 못찾음
    // await page.waitForSelector('.adsbygoogle', {
    //   visible: true
    // })
    // .then((data) => {
    //   console.info(data);
    // }).catch(e => {
    //   console.error(e);
    // })
  
    // 안나옴
    // const frame = await page.waitForFrame((frame) => {
    //    console.log(frame);
    // }).catch(e => {
    //   console.error(e);
    // })
    const results = await page.$$('.adsbygoogle:not([style*="display: none"])');

    if(results.length === 0) {
      const articles = await page.$$('.post-preview > a');
      if(articles.length !== 0){
        const selectedArticle = getRandomInt(0, articles.length);
        log(`selectedArticle: ${selectedArticle}`);
        
        const targetArticle = articles[selectedArticle];
        
        await targetArticle.evaluate(element => element.scrollIntoView({inline: "center"}));
        
        const [response] = await Promise.all([
          page.waitForNavigation({
            waitUntil: 'networkidle0'
          }), // The promise resolves after navigation has finished
          //targetArticle.click(), // Clicking the link will indirectly cause a navigation
          targetArticle.evaluate(element => element.click()),
        ]);
        // await targetArticle.click();
        // await page.waitForNavigation({
        //   waitUntil: 'networkidle0'
        // });
        const current = await page.url();
        log(`currnt : ${current}`);
      }
    } else {
      //console.info(results.length);
      if(results.length === 1){
        log('get ad');
        const ins = results[0];
        const iframe = await ins.$('iframe');
        await iframe.evaluate(element => element.scrollIntoView({inline: "center"}));

        const box = await iframe.boundingBox();
        log(`box : ${JSON.stringify(box)}`);
        //const {x, y, width, height} = box;

        const frame = await iframe.contentFrame();

        try {
          const [response] = await Promise.all([
            page.waitForNavigation({
              waitUntil: 'domcontentloaded'
            }),
            frame.$eval('a[href]', (a) => a.click()),
          ]);
        } catch(e) {
          error(e);
        }

        const current = await page.url();
        log(`currnt : ${current}`);
      }
    }

    await page.screenshot({ path: targetUrls[url] + '.png' });
    
  }
  await browser.close();
})();