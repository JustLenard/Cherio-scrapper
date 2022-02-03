# CheerioCrawler project for Emag.ro

Instructions:

1. Feed product links to the scrapper through "/apify_storage/key_value_stores/default/INPUT.json"
2. Run the scrapper with the command: apify run -p
3. Get your data from /apify_storage/datasets

The scrapped data has the following format:  
{  
 ProductName: ProductName,  
 ProductUrl: url,  
 Price: price,  
 Stock: "InStock" or "OutOfStock",  
}

Cheers!
