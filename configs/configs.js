require('custom-env').env('development')
//require('custom-env').env('staging')
// require('custom-env').env('production')

let ENV_VARIABLES = process.env;

console.log("ENV_VARIABLES", ENV_VARIABLES.db)

module.exports = {
    ...ENV_VARIABLES,
};
