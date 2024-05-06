# DAS Server

## Description
Taqtile's back end onboard project, wich consists on using the company's technology stack, patterns and practices to develop a server able
to use CRUD (Create, Read, Update, Delete) in order to interact with a database (db).

Developed by Erick Diogo de Almeida Sousa (Erick DAS)

## Environment and tools
- **Environment operating system**
    - Ubuntu 20.04.6 LTS
- **Database interaction code tools**

| Tool      | Version |
| ----------- | ----------- |
| [node.js](https://nodejs.org/en) | 20.10.0 |
| [nvm](https://github.com/nvm-sh/nvm)   | 0.39.1        |
|[npm](https://docs.npmjs.com/)|10.2.3 |
|[TypeScript](https://www.typescriptlang.org/)|5.4.5 |
|[GraphQL](https://graphql.org/graphql-js/)|16.8.1|
|[Apollo Server](https://www.apollographql.com/docs/apollo-server/)|4.10.4|


- **Database generation/running tools**

| Tool | Version |
| ---- | ------- |
|[Docker](https://www.docker.com/)|26.0.1|
|[PostgreSQl](https://www.postgresql.org/)|16.2|
|[Prisma](https://www.prisma.io/)|5.13.0|

- **Code aesthetics and formatting tools** 
These are simple to manage with VSCode
    
| Tool | Version |
| ---- | ------- |
| [eslint](https://eslint.org/) | 8.57.0 |
| [prettier](https://prettier.io/) | 3.2.5 |
| [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier) | 5.1.3 |

## Steps to run and debug

**Remember to run all the commands on the root of the directory**

1. Clone the project to your machine:
`git clone git@github.com:indigotech/onboard-erick-sousa.git`

2. Install all the necessary packages with npm :
`npm install`

3. Run the database with docker:
`docker compose up -d`

4. Start the server:
Before running, create a `.env` file to define the variable "`DATABASE_URL`", [like so](https://www.prisma.io/docs/orm/more/development-environment/environment-variables/managing-env-files-and-setting-variables). And then run the command: `npm start`

5. Once the database and the server are up, one can acess the server at [local host port 4000](http://localhost:4000/)

