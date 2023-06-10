import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone'
import * as fs from 'fs'
import path from 'path'


const typeDefs = `#graphql
  type File {
    name: String
    path: String
    size: String
    type: String
    created: String
  }

  type Directory {
    name: String
    path: String
    size: String
    type: String
    created: String
    files: [File]
    directories: [Directory]
  }

  type Query {
    getPath(directory: String!): Directory
  }
`

const resolvers = {
  Query: {
    getPath: (_, { directory }) => {
      const files = fs.readdirSync(directory)
      const filesArray = []
      const directoriesArray = []
      files.forEach(file => {
        const filePath = path.join(directory, file)
        const stats = fs.lstatSync(filePath)
        const res = {
          name: file,
          path: filePath,
          size: stats.blksize,
          created: stats.birthtime
        }
        if (stats.isFile()) {
          res['type'] = 'file'
          filesArray.push(res)
        } else if (stats.isDirectory()) {
          res['type'] = 'directory'
          directoriesArray.push(res)
        } else if (stats.isSymbolicLink()) {
          res['type'] = 'symlink'
          directoriesArray.push(res)
        }
      })
      const dirStats = fs.lstatSync(directory)
      let directoryType = ''
      if (dirStats.isFile()) {
        directoryType = 'file'
      } else if (dirStats.isDirectory()) {
        directoryType = 'directory'
      } else if (dirStats.isSymbolicLink()) {
        directoryType = 'symlink'
      }
      return {
        name: directory,
        path: directory,
        type: directoryType,
        size: dirStats.size,
        created: new Date(dirStats.birthtime).toString(),
        files: filesArray,
        directories: directoriesArray
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 }
})

console.log(`🚀 Server is ready at: ${url}`)
