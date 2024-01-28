import ts from 'rollup-plugin-typescript2'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: path.resolve(dirname, './lib/index.esm.js'),
        format: "es"
      },
      {
        file: path.resolve(dirname, './lib/index.cjs.js'),
        format: "cjs"
      },
      {
        file: path.resolve(dirname, './lib/index.umd.js'),
        format: "umd",
        name: "FufuTracker"
      },
      {
        input: "./src/index.ts",
        file: path.resolve(dirname, './lib/index.js'),
        format: "umd",
        name: "tracker"
      }
    ],
    plugins: [
      ts(),
    ]
  }
]
