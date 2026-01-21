const mysql = require('mysql2');
const utils = require('./utils.js');
module.exports = class {
    #connection;
    #query;
    constructor(credentials) {
        this.#connection = mysql.createConnection(credentials);
        this.#getConnection().connect();
        this.#query = utils.promisify(this.#connection.query.bind(this.#connection))
    }
    /*
    Modularized connection object to enable connection pooling later.
     */
    #getConnection() {
        return this.#connection;
    }
    /*
    Insert to database
     */
    put(params) {
        const columns = params.columns;
        const table = params.table;
        const keys = Object.keys(columns);
        const statement = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`
        const values = keys.map(key=>params.values[key]);
        return this.#query(statement,values);
    }
    /*
    Retrieve from database
     */
    fetch(params) {
        const statement = `SELECT * FROM ${params.table}`
        if (!params.filters) return this.#query(statement+';');
        const filters = utils.joinObject(params.filters,' = ',' AND ');
        return this.#query(`${statement} WHERE ${filters};`);
    }
    /*
    Update an entry in database
     */
    update(params) {
        const {table,columns,filters} = params;

        const setKeys = Object.keys(columns);
        const setClause = setKeys.map(key => `${key} = ?`).join(', ');
        const setValues = setKeys.map(key => columns[key]);

        const filterKeys = Object.keys(filters);
        const whereClause = filterKeys.map(key => `${key} = ?`).join(' AND ');
        const whereValues = filterKeys.map(key => filters[key]);

        const statement = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

        return this.#query(statement, [...setValues, ...whereValues]);
    }
    /*
    DELETE
     */
    delete(params) {
        const { table, filters } = params;
        const keys = Object.keys(filters);
        const whereClause = keys.map(k => `${k} = ?`).join(' AND ');
        const values = keys.map(k => filters[k]);
        const statement = `DELETE FROM ${table} WHERE ${whereClause}`;
        return this.#query(statement, values);
    }
    /*
    METRICS
     */
    metrics() {
        const statement = `
        SELECT r.id, r.name, r.location, r.type, COUNT(req.id) AS request_count FROM resources r
        LEFT JOIN requests req ON r.id = req.resource_id
        GROUP BY r.id, r.name, r.location, r.type
        ORDER BY request_count DESC;
    `;
        return this.#query(statement);
    }
}