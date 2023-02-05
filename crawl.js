const { JSDOM } = require("jsdom");


async function crawlPage(currentURL) {
    console.log(`actively crawling: ${currentURL}`);
    try {
        const response = await fetch(currentURL);
        if (response.status > 399) {
            console.log(`error in fetch with status code: ${response.status} on page: ${currentURL}`);
            return
        }

        const contentType = response.headers.get("content-type");
        if (!contentType.includes("text/html")) {
            console.log(`non html response, content type: ${contentType} on page: ${currentURL}`);
        }

        console.log(await response.text());
    } catch (err) {
        console.log(`error in fetch: ${err}, on page: ${currentURL}`);
    }

}

function getURLsFromHTML(htmlBody, baseURL) {
    const urls = [];
    const dom = new JSDOM(htmlBody);
    const linkElements = dom.window.document.querySelectorAll("a");

    for (const linkElement of linkElements) {
        if (linkElement.href.slice(0, 1) === "/") {
            // relative
            try {
                const urlObj = new URL(`${baseURL}${linkElement.href}`);
                urls.push(urlObj.href);
            } catch (err) {
                console.log(`error with relative url: ${err.message}`);
            }
        } else {
            // absolute
            try {
                const urlObj = new URL(linkElement.href);
                urls.push(urlObj.href);
            } catch (err) {
                console.log(`error with absolute url: ${err.message}`);
            }
        }
    }
    return urls;
}

function normalizeURL(urlString) {
    const urlObj = new URL(urlString);
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
        return hostPath.slice(0, -1);
    }
    return hostPath;
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}