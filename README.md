# Set up Instructions

After cloning the repository and opening it, run 'npm install' in the terminal to download
all the required dependencies.

In order to set up everything running you will have to set up .env file in the project as well
as a few other programs.

The .env file can go in either the top level directory, or in ./src/backend/.

## PostgreSQL

For our project we used PostgreSQL as our database, hosted locally on our systems. In order to set up PostgreSQL for our project,
you will need to create a database and insert the database url as an env variable DATABASE_URL.

Our group used pgAdmin4, which provides an easy UI, to help manage our database. The following instructions will detail how to
set up a database and get the database url using pgAdmin 4.

1. Download pgAdmin4
2. Register a new server, by right clicking on the "Servers" tab, and then clicking "Register -> Server"
   - a. On launch you will be asked to create a password, create one and remember it - it'll be important!
   - b. Select a name, keep server group as the default
   - c. In the Connection tab, set host name/address to localhost
   - d. In the password field, enter in the password you created when you first launched pgAdmin4. Select save password if you wish.
   - e. Leave all other fields as the default. Click save to register your server!
3. We will now be setting up Prisma ORM to work with out database.
   - a. In your .env file (remember to create it in either ./src/backend or in the top level directory), define a variable
     DATABASE_URL.
   - b. Set this variable to the database url, which will have the following format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   - All required information for this can be easily found in pgAdmin 4 by clicking the 2nd tab from the top on the left
     navigation bar, titled 'Query Tool Workspace', and then selecting your server.
     - i Your USER will be the field in the User tab, most likely postgres.
     - ii. Your PASSWORD will be the password you set for the database when launching pgAdmin4 and subsequently used to register the server.
     - iii. Your HOST is the value you set for Host name/address, which is localhost for our purposes
     - iv. Your PORT is the port the server is running on, which should be 5432 since this is the default value.
     - v. Your DATABASE is your database name, and the value can be found by going to the tab we previously mentioned. By default, this should just be 'postgres'
   - c. Set your current working directory in our project to src/backend
   - d. Run the command 'npx prisma db push', to sync your database with the prisma schema.
   - e. db push should automatically generate a prisma client. However, to be safe run 'npx prisma generate'!

The database is now set up

## Firebase

We used Firebase for our user authentication.

For testing purposes for graders, the required env variables which we used are all in the submission.

However, for the average cloner, if you wanted to set up your own Firebase project, so that you are admin,
you would need to do the following:

1. Go to the Firebase console (https://console.firebase.google.com/u/0/), create an account if necessary.
2. Select 'Create a new Firebase project' and select a name and continue.
3. Once your project is created, you will be asked to add an app. Select the Web option (with the </> symbol)
   - a. Register your project with a name. Hosting is not needed.
4. Once your project is registered, copy/paste the given firebaseConfig object into src/frontend/firebase.ts,
   replacing the one that is already there.
5. Go to 'Project Settings => Service Accounts" in the Firebase console
6. With Firebase Admin SDK, select 'Generate new private key', which will download a .json file with admin credentials
7. In your .env file, set the following environment variables, whose values will all be found in the json file:
   - a. FIREBASE_PROJECT_ID, this is the value of the key "project_id" in the json file
   - b. FIREBASE_CLIENT_EMAIL, this is the value of the key "client_email" in the json file
   - c. FIREBASE_PRIVATE_KEY, this is the value of the key "private_key" in the json file.
   - i. IMPORTANT!! Copy the entire value (including the hyphens and BEGIN/END PRIVATE KEY) but when you are pasting it into your .env file, replace the \n's with actual return characters.
8. Return to your project overview and click on the 'Authentication' tab
9. Enable authentication, and set Email/Password as your method

Firebase is now successfully set up.

## GoogleBooks API KEY

Again, for the purposes of grading the API key is included in the .env file of our
submission.

However, for the average cloner here are the instructions:

1. Go to Google Cloud console and create an account if necessary.
2. In Quick Access, click the 'APIs & Services' tab
3. Select 'Library' and then search for 'Books API' in the search bar
4. Select the API and click the enable button
5. Go to credentials tab and select 'Create credentials' => 'API key'
6. In your .env file, set variable API_KEY to the generated api key.

You now have everything you need to run our project.

## Running the program

In the console, you can run 'npm run build' and then 'npm run server' and then
open the link for the server, or you can run 'npm run server' and 'npm run dev'
in two terminal instances simultaneously, and then open the link for the dev server
and use it from there.
