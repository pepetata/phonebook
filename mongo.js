const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}
if (process.argv.length === 4) {
  console.log("give name and phone as argument");
  process.exit(1);
}

const password = process.argv[2];

//const url = `mongodb+srv://pepetata:${password}@training.hiujmlb.mongodb.net/?retryWrites=true&w=majority&appName=training`
const url = `mongodb+srv://pepetata:${password}@training.hiujmlb.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=training`;
mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);



if (process.argv.length === 3) {
  Person
  .find({})
  .then((persons) => {
    persons.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
}

if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];
const person = new Person({
  name: name,
  number: number,
})

person.save().then(result => {
  console.log(`added ${name} number ${number}`)
  mongoose.connection.close()
})
}