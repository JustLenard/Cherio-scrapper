/**
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

const Apify = require("apify");
const { handleStart, handleList, handleDetail } = require("./src/routes");

const {
    utils: { log },
} = Apify;

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();

    const requestList = await Apify.openRequestList("start-urls", startUrls);
    const requestQueue = await Apify.openRequestQueue();
    // const proxyConfiguration = await Apify.createProxyConfiguration();

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        // proxyConfiguration,
        // Be nice to the websites.
        // Remove to unleash full power.
        maxConcurrency: 50,
        handlePageFunction: async (context) => {
            const {
                url,
                userData: { label },
            } = context.request;
            log.info("Page opened.", { label, url });
            log.info(context.$(".page-title").text().trim());
            log.info(
                context
                    .$("p.product-new-price.has-deal")
                    .first()
                    .html()
                    .replace("<sup>", ".")
                    .split("<")[0]
            );

            log.info(context.$(".label-in_stock").text());
            log.info(url);

            // log.info(context.$(".page-title").text().trim());
            // log.info(context.body);

            // const text = context(".page-title").text();
            // log.info(text);
            // log.info($(".page-title").text());
            switch (label) {
                case "LIST":
                    return handleList(context);
                case "DETAIL":
                    return handleDetail(context);
                default:
                    return handleStart(context);
            }
        },
    });

    log.info("Starting the crawl.");
    await crawler.run();
    log.info("Crawl finished.");
});
