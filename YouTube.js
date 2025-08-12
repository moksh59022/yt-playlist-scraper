const puppeteer = require("puppeteer")
const pdf = require('pdfkit')
const fs = require('fs')



let link = 'https://www.youtube.com/playlist?list=PLW-S5oymMexXTgRyT3BWVt_y608nt85Uj'
let cTab
(async function(){
   try{
       let browserOpen = puppeteer.launch({
        headless : false,
        defaultViewport : null,
        args: [ '--start-maximized']
       })
   
        let browserInstance = await browserOpen
        let allTabsArr = await browserInstance.pages()
        cTab = allTabsArr[0]
        await cTab.goto(link)
        await cTab.waitForSelector('h1#title')
        let name = await cTab.evaluate(function(select){return document.querySelector(select).innerText} , 'h1#title')
        // console.log(name);
        
        let allData = await cTab.evaluate(getData , '.yt-content-metadata-view-model-wiz__metadata-row > span.yt-core-attributed-string')
        console.log(name , allData.noOfVideos , allData.noOfViews);
        
        let TotalVideos = allData.noOfVideos.split(" ")[0]
        console.log(TotalVideos);

        let currentVideos = await getCVideosLength()
        console.log(currentVideos);
        
        while(TotalVideos-currentVideos >= 20){
            await scrollToBottom()
            currentVideos = await getCVideosLength()

        }


        let finalList = await getStats()
        // console.log(finalList);
        let pdfDoc = new pdf
        pdfDoc.pipe(fs.createWriteStream('NCS.pdf'))
        pdfDoc.text(JSON.stringify(finalList))
        pdfDoc.end()
        
        

    }catch (error){
      console.log(error);
      
   }
})()


function getData(selector){
  let allElems = document.querySelectorAll(selector)
  let noOfVideos = allElems[1].innerText
  let noOfViews = allElems[2].innerText
  return {
    noOfVideos,noOfViews
  }
}

async function getCVideosLength() {
    let length = await cTab.evaluate(getLength , '#container>#thumbnail .yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail')
    return length
}


function getLength(durationSelect){
   let durationElem = document.querySelectorAll(durationSelect)
   return durationElem.length
}


async function scrollToBottom() {
    await cTab.evaluate(goToBottom)
    function goToBottom(){
        window.scrollBy(0,window.innerHeight);
    }
}

async function getStats() {
    let list = await cTab.evaluate(getNameAndDuration , "#video-title" , '.badge-shape-wiz__text' )
    return list

}

function getNameAndDuration(videoSelector , durationSelector){
    let videoElem = document.querySelectorAll(videoSelector)
    let durationElem = document.querySelectorAll(durationSelector)

    let currentList = []

    for(let i = 0;i<durationElem.length;i++){
        let videoTitle = videoElem[i].innerText
        let duration = durationElem[i].innerText
        currentList.push(videoTitle , duration)
    }
    return currentList;  
}