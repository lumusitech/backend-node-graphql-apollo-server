import { ApolloServer, gql } from 'apollo-server'

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
    allPersons: [Person]!
    findPerson(name: String!): Person
  }
`

const resolvers = {
  Query: {
    personsCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => persons.find(person => person.name === args.name),
  },

  Person: {
    address: root => ({
      street: root.street,
      city: root.city,
    }),
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
