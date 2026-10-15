# MongoDB and Mongoose Practice

- `mongoose-schema-validation.js`: a product schema with nested fields, sub-document arrays, a validator comparing two fields, a conditional `required`, an async validator, a pre-save hook, a virtual, an instance method and a static method. It saves two valid products and six invalid ones and prints each error.
- `aggregation-queries.js`: exam results with `$unwind`, `$group`, `$addFields`, `$filter`, `$lookup`, `$cond`, `$bucket` and `$facet`.

## How to run
Start MongoDB, then `npm install`, `npm run validation`, `npm run aggregation`. Set `MONGO_URL` for a different database.
