Code for DC Edu: School Chooser
===============================

Do you want to see this running? You can see it at [school-chooser.herokuapp.com](http://school-chooser.herokuapp.com/).

Do you want to get your forked/cloned dev copy running? You'll need [node](http://nodejs.org/) (includes npm), [MongoDB](http://www.mongodb.org/), and (optionally, for development) [supervisor](https://github.com/isaacs/node-supervisor).

```shell
# Install dependencies
npm install

# Start mongodb in background
mongod --fork

# Run grunt
grunt dev

# Start node server
node server.js

# Alternatively, start node server with re-load on file change
supervisor server.js

# If you're making changes, you might want to have grunt pay attention
grunt watch
```
