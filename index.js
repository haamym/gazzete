const puppeteer = require("puppeteer");
require("dotenv").config();

const telegramChatId = process.env.CHAT_ID;
const telegramToken = process.env.TOKEN;

function getTodaysDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

const todaysDate = getTodaysDate();

console.log("Today's date: ", todaysDate);

const urls = [
  `https://www.gazette.gov.mv/iulaan?type=masakkaiy&job-category=&office=&q=${encodeURIComponent(
    "ޓޭންކް"
  )}&start-date=${todaysDate}&end-date=`,
  `https://www.gazette.gov.mv/iulaan?type=masakkaiy&job-category=&office=&q=${encodeURIComponent(
    "ތާނގި"
  )}&start-date=${todaysDate}&end-date=`,
  `https://www.gazette.gov.mv/iulaan?type=masakkaiy&job-category=&office=&q=${encodeURIComponent(
    "ސްޓަރަކްޗަ"
  )}&start-date=${todaysDate}&end-date=`,
];

async function sendMessageToTelegram(text) {
  const fetch = (await import("node-fetch")).default;
  const apiUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text: text,
      parse_mode: "HTML",
    }),
  });

  return response.json();
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  for (const url of urls) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const itemDetails = await page.evaluate(() => {
      const itemElements = document.querySelectorAll(".items");
      const items = [];
      itemElements.forEach((item) => {
        const titleElement = item.querySelector(".iulaan-title");
        if (titleElement) {
          items.push({
            title: titleElement.innerText.trim(),
            url: titleElement.href,
          });
        }
      });
      return items;
    });

    function extractQueryParamValue(url, paramName) {
      const params = url.split("&");

      const param = params.find((param) => param.startsWith(`${paramName}=`));

      if (param) {
        const value = decodeURIComponent(param.split("=")[1]);
        return value;
      }

      return url;
    }

    if (itemDetails && itemDetails.length > 0) {
      for (const item of itemDetails) {
        const message = `Title: ${item.title}\nURL: ${item.url}`;
        await sendMessageToTelegram(message);
      }
    } else {
      const message = `No Iulaan Found Under the name of ${extractQueryParamValue(
        url,
        "q"
      )} for the date ${todaysDate}`;
      console.log(message);
      await sendMessageToTelegram(message);
    }

    await page.close();
  }

  await browser.close();
})();
