const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubsub = new PubSub();


const users = [
  {
    id: 1,
    fname: 'Richie',
    age: 27,
    likes: 0,
  },
  {
    id: 2,
    fname: 'Betty',
    age: 20,
    likes: 205,
  },
  {
    id: 3,
    fname: 'Joe',
    age: 28,
    likes: 10,
  },
];

const posts = [
  {
    id: 1,
    userId: 2,
    body: "Hello how are you?"
  },
  {
    id: 1,
    userId: 3,
    body: "What's up?"
  },
  {
    id: 1,
    userId: 1,
    body: "Let's learn GraphQL"
  },
]

const typeDefs = gql`
  type User {
    id: Int
    fname: String
    age: Int
    likes: Int
    posts: [Post]
  }
  type Post {
    id: Int
    user: User
    body: String
  }
  type Query {
    user(id: Int!): User!
    post(id: Int!): Post!
    users(id: Int!): [User]
    posts(id: Int!): [Post]
  }
  type Mutation {
    incrementLike(fname: String!) : [User!]
  }
  type Subscription {
    listenLikes : [User]
  }
`;


const resolvers = {
  Query: {
    user(root, args) { return users.filter(user => user.id === args.id)[0] },
    post(root, args) { return posts.filter(post => post.id === args.id)[0] },
    users(root, args) { return args.id ? users.filter(user => user.id === args.id) : users },
    posts(root, args) { return args.id ? posts.filter(post => post.id === args.id) : posts }
  },

  User: {
    posts: (user) => {
      return posts.filter(post => post.userId === user.id)
    }
  },

  Post: {
    user: (post) => {
      return users.filter(user => user.id === post.userId)[0]
    }
  },

  Mutation: {
    incrementLike(parent, args) {
      users.map((user) => {
        if(user.fname === args.fname) user.likes++
        return user
      })

      pubsub.publish('LIKES', {listenLikes: users});
      
      return users
    }
  },

  Subscription: {
    listenLikes: {
      subscribe: () => pubsub.asyncIterator(['LIKES'])
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});