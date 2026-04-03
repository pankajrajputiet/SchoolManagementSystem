/**
 * Builds a paginated, filtered, sorted query from request query params.
 *
 * Supported query params:
 *  - page (default 1)
 *  - limit (default 10)
 *  - sort (e.g. "-createdAt,name")
 *  - fields (e.g. "name,email")
 *  - search (text search on indexed fields)
 *
 * @param {import('mongoose').Model} model - Mongoose model
 * @param {Object} query - req.query
 * @param {Object} filter - Additional filter conditions
 * @param {string} populate - Populate string or array
 * @returns {Promise<{data: Array, pagination: Object}>}
 */
const paginate = async (model, query, filter = {}, populate = '') => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Sort
  let sort = '-createdAt';
  if (query.sort) {
    sort = query.sort.split(',').join(' ');
  }

  // Field selection
  let fields = '';
  if (query.fields) {
    fields = query.fields.split(',').join(' ');
  }

  // Search
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const total = await model.countDocuments(filter);
  let dbQuery = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (fields) {
    dbQuery = dbQuery.select(fields);
  }

  if (populate) {
    dbQuery = dbQuery.populate(populate);
  }

  const data = await dbQuery;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = { paginate };
