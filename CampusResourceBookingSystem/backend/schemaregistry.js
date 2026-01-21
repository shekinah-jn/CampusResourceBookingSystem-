module.exports.resourceTables = {
    columns: {
        name: 'VARCHAR',
        location: 'VARCHAR',
        available: 'BOOLEAN',
        type: 'VARCHAR'
    },
    categories: {
        labs: {
            table: 'resources',
            type: 'lab'
        },
        rooms: {
            table: 'resources',
            type: 'room'
        },
        equipment: {
            table: 'resources',
            type: 'equipment'
        }
    }
};
/*
Procedure:
1) Combine the resources into one table
2) Maintain the URL routes for each individual category
 */
module.exports.requestsTables = {
    columns: {
        id: 'INT',
        resource_id: 'INT',
        username: 'VARCHAR'
    }
}

