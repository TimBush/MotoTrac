## MotoTrac

This API allows you to pull data from a few different motorcycle e-commerce sources.

This API opens up a few different use-cases for applications; just to name a few:

- Price tracking
- Displaying product data on your site for particular items
- Price or data comparisons among sites
- Visual implementations of the data

## Basic Usage

### REQUEST & BASE URL

All endpoints in this API will follow the same pattern:

```
https://example.com/<site>/<category>?<query>
```

- _Site_ - the website you'd like to pull information from
- _Category_ - The category of product your are pulling information for
- _Query_ - Typically the URL of the product

We've tried to keep the API simple to use and have split products into 3 main categories:

- _Apparel_
- _Part_
- _Tire_

We've defined these below; it's critical you specify the **correct category** as a parameter when attempting to call the API, this will insure that you get a correct and consistent JSON response.

---

## Responses

The JSON response structures will vary slightly depending on which _site_ you're pulling data from. This is in part based on how each site chooses to layout and render information. Information provided by each site also varies

---

## Definitions

### PRODUCT

This is typically any type of apparel or gear - if it has a size associated with it, it probably falls under _product_. Examples would be:

- Helmet
- Jacket
- Boots
- General Riding Gear

### PART

This would be any part that goes on a motorcycle or some type of accessory that goes on your person. Examples would be:

- Exhaust
- Air Filters
- Crash Bars
- Frame Sliders
- Bluetooth Communications
- GPS
- Luggage/Backpack

### TIRES

If its got rubber and it's round, it probably falls under the tire category.
