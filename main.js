const Apify = require("apify");
const { handleStart, handleList, handleDetail } = require("./src/routes");

const {
    utils: { log },
} = Apify;

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();

    const requestList = await Apify.openRequestList("start-urls", startUrls);
    const requestQueue = await Apify.openRequestQueue();

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        maxConcurrency: 50,

        handlePageFunction: async (context) => {
            const {
                url,
                userData: { label },
            } = context.request;

            // Get the title
            const title = context.$(".page-title").text().trim();

            // Get the price
            const price = context
                .$("p.product-new-price")
                .html()
                .replace(".", "")
                .replace("<sup>", ".")
                .split("<")[0];

            // Price validation
            if (isNaN(price)) {
                throw new Error(
                    `The price is ${price}, which is not a Number. Please fix.`
                );
            }

            // Get the stock
            let stock = context.$("div.stock-and-genius > span").first().text();

            //This is all the variety of "stock's availability" that I've found on the site. There is probably more.
            const inStock = [
                "În stoc",
                "Ultimul produs in stoc",
                "Ultimele 2 produse",
                "Ultimele 3 produse",
            ];
            const outOfStock = ["Indisponibil", "disponibil in showroom"];

            // Stock "Translation" and validation
            if (inStock.includes(stock)) {
                stock = "InStock";
            } else if (outOfStock.includes(stock)) {
                stock = "OutOfStock";
            } else {
                throw new Error(
                    `The value of stock is "${stock}" and it's is not mentioned in "inStock" or "outOfStock" variables. Please fix. Product page: ${url}`
                );
            }

            await Apify.pushData({
                ProductName: title,
                ProductUrl: url,
                Price: price,
                Stock: stock,
            });
        },
    });

    log.info("Starting the crawl.");
    await crawler.run();
    log.info("Crawl finished.");
});
