import { ApolloServer, UserInputError, gql } from 'apollo-server'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

export const persons = [
  {
    name: 'John Doe',
    phone: '123-456-7890',
    street: '123 Main St',
    city: 'New York',
    id: 1,
  },
  {
    name: 'Jane Smith',
    phone: '987-654-3210',
    street: '456 Elm St',
    city: 'San Francisco',
    id: 2,
  },
  {
    name: 'Mike Johnson',
    phone: '555-123-4567',
    street: '789 Oak St',
    city: 'Chicago',
    id: 3,
  },
]

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
    personsCount: () => persons.length,
    allPersons: async (root, args) => {
      if (!args.phone) {
        return persons
      }

      const byPhone = args.phone === 'YES' ? p => p.phone : p => !p.phone

      return persons.filter(byPhone)
    },
    findPerson: async (root, args) => persons.find(person => person.name === args.name),
  },

  Person: {
    address: root => ({
      street: root.street,
      city: root.city,
    }),
  },

  Mutation: {
    addPerson: (root, args) => {
      if (persons.find(person => person.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name,
        })
      }
      const person = {
        ...args,
        id: uuidv4(),
      }
      persons.push(person)
      return person
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex(person => person.name === args.name)
      if (personIndex === -1) return null

      const person = persons[personIndex]

      const updatedPerson = { ...person, phone: args.phone }

      persons[personIndex] = updatedPerson

      return updatedPerson
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
