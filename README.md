# Express JSON Web Token Seed

As frustrated with dogmatic approach towards stateless authentication as I am? Here is the solution to all your problems: An Express web app preconfgiured to use JSON Web Token.
No longer will you lose any sleep over getting the stateless authentication right (or getting it to actually be stateless).

#### Disclaimer -
  1 This application uses blacklisting of tokens in redis to emulate user logout.  
  2 Configurations are located at src/common/constants (i know, it's weird).

## How to use
Step 1 - Clone the repository  
Step 2 - Run commad  `npm install`  
Step 3 - Start Using (or goto Step 1 if you really liked the steps)

## Running the app
Step 0 - Ensure that mongod and redis-server are running  
Step 1 - run command `gulp compile` to compile the typescript sources  
Step 2 - run command `gulp watch` to auto-compile after any of your changes  
Step 3 - run command `node dist\app` to run the app (in a new tab, please)

### Testing
Step 0 - compile the tests using `gulp compile` if you haven't already done so.  
Step 1 - run command `npm test`
