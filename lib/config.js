'use strict'

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

function config (opts) {
  const configFile = path.resolve(process.cwd(), opts.config)
  const defaultConfig = opts.defaultConfig || 'a-pollo.yml'

  return {
    load: load
  }

  function load (cb) {
    const configName = path.parse(configFile).base

    if (fs.existsSync(configFile)) {
      const config = yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'))
      const cssLoaded = fs.readFileSync(config.assets.css, 'utf-8')
      cb(null, config, cssLoaded)
    } else if (configName === defaultConfig) {
      cb(new Error(`creating config, prompt dialog missing`))
    } else {
      cb(new Error(`config file '${configName}' not found`))
    }
  }
}

module.exports = config