require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const Person = require("./models/person");

app.use(cors());
app.use(express.json());
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(express.static("dist"));
let persons = [];

// ********************************************************** Persons
/////////////////////////////////////////////////////  gets
app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    response.json(result);
    persons = result;
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

function formatDate(date = new Date()) {
  const now = date; // Create a specific Date object for the example
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "longOffset",
  };
  return (
    now.toLocaleDateString("en-US", options) +
    " (" +
    now.toLocaleTimeString("en-US", { timeZoneName: "short" }) +
    ")"
  );
}

app.get("/info", (request, response) => {
  Person.find({}).then((result) => {
    persons = result;
    console.log(`reuslt`, result);
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p><p>${formatDate()}`
    );
  });
});

/////////////////////////////////////////////////////  deletes
app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

/////////////////////////////////////////////////////  posts
app.post("/api/persons", (request, response,next) => {
  const body = request.body;

  // for (const field of ["name", "number"]) {
  //   if (!body[field]) {
  //     return response.status(400).json({ error: `${field} missing` });
  //   }
  // }

  // if (persons.some((e) => e.name === body.name))
  //   return response.status(400).json({ error: `name must be unique` });

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((result) => {
      console.log("person saved!", person.name);
      response.json(person);
    })
    .catch((error) => next(error));

  persons = persons.concat(person);
});

/////////////////////////////////////////////////////  put
app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  const body = request.body;
  console.log("id-------", id, body);

  Person.findByIdAndUpdate(
    id,
    { name: body.name, number: body.number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

///////////////////////////////////////////////////// unknown Endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

///////////////////////////////////////////////////// error handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "mal formatted id" });
  } else if (error.name === "ValidationError") {
    // Collect all error messages from error.errors
    const messages = Object.values(error.errors).map(e => e.properties && e.properties.message ? e.properties.message : e.message);
    // Send only the messages, not the "ValidationError" prefix
    return response.status(400).json({ error: messages.join(", ") });
  }
  next(error);
};
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
