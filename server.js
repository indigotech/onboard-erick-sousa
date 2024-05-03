var express = require("express") // TODO: Search about ES and CommonJS modules
var { createHandler } = require("graphql-http/lib/use/express")
var { buildSchema } = require("graphql")
var { ruruHTML } = require("ruru/server")
 
// Build a query type schema
// hello is a filed inside data. There is no object
var schema = buildSchema(`
  type Query {
    hello: String
  }
`)
 
// Function to be called by the handler
var rootFunc = {
  hello() {
    return "Hello world!"
  }
}
 
// Use express and graqhql to handle the query
var app = express()
 
app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: rootFunc,
  })
)
 
// Use graphiQL/ruru
app.get("/", (_req, res) => {
  res.type("html")
  res.end(ruruHTML({ endpoint: "/graphql" }))
})
 
// Start the server at port
app.listen(4000)
console.log("Server at http://localhost:4000/graphql")