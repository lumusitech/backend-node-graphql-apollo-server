import { ApolloServer, UserInputError, gql } from 'apollo-server'
import Person from './models/person.js'
import User from './models/user.js'
import './db.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

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

  type User {
    username: String!
    friendList: [Person]!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    personsCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation {
    addPerson(name: String!, phone: String, street: String!, city: String!): Person
    editNumber(name: String!, phone: String!): Person
    createUser(username: String!): User
    login(username: String!, password: String!): Token
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
    me: async (root, args, context) => {
      if (!context.currentUser) {
        throw new Error('not authenticated')
      }
      return context.currentUser
    },
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
    createUser: async (root, args) => {
      const user = new User({ username: args.username })

      // alternatively, you can catch the error
      return await user.save().catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args.username,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      //! wrong! - it is only for demo purposes
      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return {
        value: jwt.sign(userForToken, process.env.JWT_SECRET),
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      // remove Bearer and 1 space from string to only have token
      const token = auth.substring(7)
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id).populate('friendList')
      return { currentUser }
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
