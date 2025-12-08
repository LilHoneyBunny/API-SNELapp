const puppeteer = require("puppeteer");

async function generateStudentReportPDF(htmlContent, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.pdf({ path: outputPath, format: "A4", printBackground: true });
    await browser.close();
    return outputPath;
}


module.exports = {generateStudentReportPDF };