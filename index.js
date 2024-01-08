import { ApolloServer, UserInputError, gql } from 'apollo-server'
import Person from './models/person.js'
import './db.js'

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    id: ID!
    address: Address!
  }

  type Query {
    personsCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(name: String!, phone: String, street: String!, city: String!): Person
    editNumber(name: String!, phone: String!): Person
  }
`

const resolvers = {
  // TODO: Implement resolvers using mongoose
  Query: {
    personsCount: async () => await Person.collections.countDocuments(),
    // TODO: Implement filter by phone with mongoose
    allPersons: async (root, args) => {
      if (!args.phone) return await Person.find({})

      return Person.find({ phone: { $exists: args.phone === 'YES' } })
    },
    findPerson: async (root, args) => await Person.findOne({ name: args.name }),
  },

  Person: {
    address: root => ({
      street: root.street,
      city: root.city,
    }),
  },

  Mutation: {
    addPerson: async (root, args) => {
      const person = new Person({ ...args })
      return await person.save()
    },
    editNumber: async (root, args) => {
      try {
        return await Person.findOneAndUpdate(
          { name: args.name },
          { phone: args.phone },
          { new: true },
        )
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args.name,
        })
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
