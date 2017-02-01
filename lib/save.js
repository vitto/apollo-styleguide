'use strict'

const async = require('async')
const decorator = require('./decorator-data')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const stripIndent = require('strip-indent')
const YAML = require('json2yaml')

function save (config, annotations, cb) {

  annotations.forEach(function (annotation) {
    console.log(annotation);
  })

  const docs = decorator.sortByDocumentation({
    annotations: annotations,
    slugBase: 'docs',
    filter: 'doc',
    path: config.styleguide.docs
  }).concat(decorator.sortBySource({
    annotations: annotations,
    slugBase: 'snippets',
    filter: 'snippet',
    path: config.styleguide.docs
  })).concat(decorator.sortBySnippetType({
    annotations: annotations,
    slugBase: 'identity',
    filter: 'color',
    path: config.styleguide.docs
  }))

  async.eachLimit(docs, 10,
    function (doc, done) {
      const filePath = path.resolve(config.temp, doc.file)
      const filePathParsed = path.parse(filePath, 0, 2)

      doc.annotations.breadcrumb = doc.breadcrumb

      const ymlText = YAML.stringify({ annotations: doc.annotations })
      const frontMatter = stripIndent(`${ymlText}\n`)

      fse.mkdirs(filePathParsed.dir, function (err) {
        if (err) { throw err }
        fs.writeFile(filePath, frontMatter, function (err) {
          if (err) { throw err }
          done()
        })
      })
    },
    function (err) {
      if (err) { cb(err) }
      cb(null, config, docs)
    }
  )
}

module.exports = save