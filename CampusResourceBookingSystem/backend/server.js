const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const dao = require('./dao.js');
const utils = require('./utils.js');
const schemaMap = require('./schemaregistry');
const resourceTables = schemaMap.resourceTables;

const db = new dao({
   host: 'localhost',
   user: 'root',
   password: '12345678',
   port: 3306,
   database: 'concordia_soen_proj'
});

const server = express();

server.use(express.json());

/*
====================
USER MANAGEMENT ROUTES
====================
*/

// Get user data by username (for login and profile loading)
server.get('/api/users/:username', async (req, res) => {
   const { username } = req.params;

   try {
      const usersPath = path.join(__dirname, '../frontend/resources/users.json');
      const data = await fs.readFile(usersPath, 'utf8');
      const users = JSON.parse(data);

      // Search in both students and admins
      let user = users.students.find(u => u.username === username);
      let userType = 'student';

      if (!user) {
         user = users.admins.find(u => u.username === username);
         userType = 'admin';
      }

      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Return user without password for security
      const { password, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, userType });

   } catch (error) {
      console.error('Error reading users:', error);
      res.status(500).json({ error: 'Failed to load user data' });
   }
});

// Update user profile
server.put('/api/users/:username', async (req, res) => {
   const { username } = req.params;
   const { firstName, lastName, email, phone, password, userType } = req.body;

   try {
      const usersPath = path.join(__dirname, '../frontend/resources/users.json');
      const data = await fs.readFile(usersPath, 'utf8');
      const users = JSON.parse(data);

      // Determine which array to update
      const userArray = userType === 'admin' ? 'admins' : 'students';
      const userIndex = users[userArray].findIndex(u => u.username === username);

      if (userIndex === -1) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Update user data
      const updatedUser = {
         username: username, // username shouldn't change
         firstName: firstName,
         lastName: lastName,
         email: email,
         phone: phone,
         password: password || users[userArray][userIndex].password // keep old password if not provided
      };

      users[userArray][userIndex] = updatedUser;

      // Write back to file
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8');

      // Return success without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({
         success: true,
         message: 'Profile updated successfully',
         user: userWithoutPassword
      });

   } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update profile' });
   }
});

// Validate login credentials
server.post('/api/login', async (req, res) => {
   const { username, password, userType } = req.body;

   try {
      const usersPath = path.join(__dirname, '../frontend/resources/users.json');
      const data = await fs.readFile(usersPath, 'utf8');
      const users = JSON.parse(data);

      // Get appropriate user list
      const userArray = userType === 'admin' ? users.admins : users.students;
      const user = userArray.find(u => u.username === username && u.password === password);

      if (!user) {
         return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Validate username prefix matches user type
      const prefix = username.substring(0, 3);
      if ((userType === 'student' && prefix !== '403') ||
          (userType === 'admin' && prefix !== '503')) {
         return res.status(401).json({ error: 'Invalid user type' });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({
         success: true,
         user: userWithoutPassword,
         userType: userType
      });

   } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Login failed' });
   }
});

/*
====================
RESOURCE MANAGEMENT ROUTES (EXISTING)
====================
*/

/*
SQL Safety middleware: Check the provided resource name before routing to the appropriate handler.
 */
server.use('/admin/:resource', (req, res, next) => {
   const { resource } = req.params;
   const entry = resourceTables.categories[resource];

   if (!entry) {
      res.status(404).json({ error: 'Resource category not found' });
      return;
   }

   req.table_name = entry.table;
   req.resource_type = entry.type;
   req.required_columns = resourceTables.columns;

   next();
});

/*
GET
 */
server.get('/admin/:resource',(request,response)=>{
   const {id} = request.query;

   if (!id) {
      db.fetch({
         table: request.table_name,
         filters: {
            type: `'${request.resource_type}'`
         }
      }).then(result=>response.json(result));
      return;
   }

   if (!utils.isNumeric(id)) {
      response.status(400).json({error: 'id must be a positive integer'});
      return;
   }

   db.fetch({
      table: request.table_name,
      filters: {
         id: Number(id),
         type: `'${request.resource_type}'`
      }
   }).then(result=>response.json(result));
});

/*
POST
 */
server.post('/admin/:resource',(request,response)=>{
   /*
   we have the validated table
   we need to extract the values from the body (already JSONIFIED using middleware)
    */
   const {name,location,available} = request.body;
   db.put({
      table: request.table_name,
      columns: request.required_columns,
      values: {
         name: name,
         location: location,
         available: available.toLowerCase() === 'true',
         type: request.resource_type
      }
   }).then(() =>{
      response.status(200).json({success: 'Successfully added new resource'})
   }).catch(err=>{
      response.status(500).json({error: err})
   });
});
/*
PUT (UPDATE)
 */
server.put('/admin/:resource', (req, res) => {
   const { id, name, location, available } = req.body;

   if (!id || !utils.isNumeric(id)) {
      res.status(400).json({ error: 'Valid id is required' });
      return;
   }

   const columns = {};
   if (name !== undefined) columns.name = name;
   if (location !== undefined) columns.location = location;
   if (available !== undefined) columns.available = available;

   const filters = {
      id: Number(id),
      type: req.resource_type
   };

   db.update({
      table: req.table_name,
      columns,
      filters
   }).then(() => {
      res.json({ success: 'Resource updated successfully' });
   }).catch(err => {
      res.status(500).json({ error: err });
   });

});

server.delete('/admin/:resource', (req, res) => {
   const { id } = req.body;

   if (!id || !utils.isNumeric(id)) {
      res.status(400).json({ error: 'Valid id is required' });
      return;
   }

   db.delete({
      table: req.table_name,
      filters: {
         id: Number(id),
         type: req.resource_type
      }
   }).then(() => {
      res.json({ success: 'Resource deleted successfully' });
   }).catch(err => {
      res.status(500).json({ error: err });
   });
});

/*
BOOKING REQUEST MANAGEMENT
 */
server.post('/api/requests', (req, res) => {
   const { resource_id, username } = req.body;
   if (!resource_id || !utils.isNumeric(resource_id) || !username) {
      res.status(400).json({ error: 'resource_id and username required' });
      return;
   }
   db.put({
      table: 'requests',
      columns: { resource_id: 0, username: '' },
      values: { resource_id: Number(resource_id), username: username }
   }).then((result) => {
      // return the newly created request id so frontend can delete it later
      const insertId = result && result.insertId ? result.insertId : null;
      res.json({ success: 'Request created', id: insertId });
   }).catch(err => {
      res.status(500).json({ error: err });
   });
});

server.get('/api/requests', (req, res) => {
   const { id, username, resource_id } = req.query;
   const filters = {};
   if (id && utils.isNumeric(id)) filters.id = Number(id);
   if (resource_id && utils.isNumeric(resource_id)) filters.resource_id = Number(resource_id);
   if (username) filters.username = username;

   if (Object.keys(filters).length === 0) {
      db.fetch({ table: 'requests' }).then(r => res.json(r));
      return;
   }

   db.fetch({ table: 'requests', filters }).then(r => res.json(r))
       .catch(err => res.status(500).json({ error: err }));
});

server.put('/api/requests', (req, res) => {
   const { id, resource_id, username } = req.body;
   if (!id || !utils.isNumeric(id)) {
      res.status(400).json({ error: 'Valid id required' });
      return;
   }

   const columns = {};
   if (resource_id !== undefined) columns.resource_id = Number(resource_id);
   if (username !== undefined) columns.username = username;

   db.update({
      table: 'requests',
      columns,
      filters: { id: Number(id) }
   }).then(() => {
      res.json({ success: 'Request updated' });
   }).catch(err => {
      res.status(500).json({ error: err });
   });
});

server.delete('/api/requests', (req, res) => {
   const { id } = req.body;
   if (!id || !utils.isNumeric(id)) {
      res.status(400).json({ error: 'Valid id required' });
      return;
   }

   db.delete({
      table: 'requests',
      filters: { id: Number(id) }
   }).then(() => {
      res.json({ success: 'Request deleted' });
   }).catch(err => {
      res.status(500).json({ error: err });
   });
});

/*
METRICS
 */
server.get('/api/metrics/requests-per-resource', (req, res) => {
   db.metrics()
       .then(result => res.json(result))
       .catch(err => res.status(500).json({ error: err }));
});

//static
server.use(express.static('../frontend'));

server.listen(8000, () => {
   console.log('Listening on port 8000');
});
