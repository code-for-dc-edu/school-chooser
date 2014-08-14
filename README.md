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

## NPM? MongoDB? Grunt? Node? I don't have these and need to get them. What do I do?

First, let's install Node. Node is what runs the app so that your browser can view it. Download the [version for your system](http://nodejs.org/download/) and follow the included installation instructions.

Now we need a database that the app will use to store data. We use one called MongoDB. Follow the [installation instructions](http://gruntjs.com/getting-started) for your system.

Finally, we need to install grunt. This is the point at which we'll jump into the command line. You'll use the Terminal (assuming you're on a Mac or Linux) to type commands to your machine. Open up the terminal and navigate to the school-chooser directory. This command will vary depending on where it is stored, but I would type:

```shell
cd Developer/code-for-dc/school-chooser
```

Next, we're going to install Grunt, which whips our code into shape so we can run it. Run the following command:

```shell
sudo npm install grunt-cli -g
```

This will prompt you for your password.

Now we're all set. Run the commands listed at top.