/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-console */

const { ConsoleLogger } = require('@aries-framework/core')

function syncPackageJson() {
  const { execSync } = require('child_process')
  const fs = require('fs')
  const targetDir = process.cwd()
  const pak = require('./package.json')
  function parseNameAndVersion(val) {
    const sep = val.lastIndexOf('@')
    return [val.substring(0, sep), val.substring(sep + 1)]
  }
  function npmInstall(command) {
    console.log(`cmd\n${command}`)
    execSync(command, { stdio: 'inherit', cwd: process.cwd() })
  }
  //npm ls --package-lock-only
  let lockedDependenciesInLines = execSync('yarn list --depth 0 --frozen-lockfile', { cwd: __dirname })
    .toString()
    .trim()
    .split('\n')
    .splice(1)
  lockedDependenciesInLines = lockedDependenciesInLines.slice(0, lockedDependenciesInLines.length - 1)
  const lockedDependencies = lockedDependenciesInLines
    .map((item) => {
      return item.substring(3)
    })
    .reduce((prev, val) => {
      const [name, version] = parseNameAndVersion(val)
      prev[name] = version
      return prev
    }, {})
  const freezeDependency = (dependencies, item) => {
    const curVersion = dependencies[item]
    if (curVersion.startsWith('npm:')) {
      const [name] = parseNameAndVersion(curVersion.substring(4))
      dependencies[item] = 'npm:' + name + '@' + lockedDependencies[name]
    } else {
      dependencies[item] = '' + lockedDependencies[item]
    }
  }
  const freezeDependencies = (dependencies) => {
    if (dependencies) {
      for (const item of Object.keys(dependencies)) {
        freezeDependency(dependencies, item)
      }
    }
  }
  const installDependencies = (dependencies) => {
    if (dependencies) {
      for (const item of Object.keys(dependencies)) {
        const command = `yarn add ${item}@${dependencies[item]} --exact`
        console.log(command)
        npmInstall(command, {
          stdio: 'inherit',
          cwd: process.cwd(),
        })
      }
    }
  }
  freezeDependencies(pak.dependencies)
  freezeDependencies(pak.peerDependencies)
  //console.log(JSON.stringify(pak.peerDependencies, undefined, 2))

  //console.log(`devDependencies:${ Object.keys(pak.devDependencies).length}`)
  freezeDependencies(pak.devDependencies)

  console.log('Installing Dependencies ...')
  installDependencies(pak.dependencies)
  console.log('Installing Peer Dependencies ...')
  installDependencies(pak.peerDependencies)

  console.log('Installing Dev Dependencies ...')
  const devAllowList = [
    '@babel/core',
    '@babel/runtime',
    '@types/lodash.merge',
    '@types/react',
    '@types/react-native',
    'babel-plugin-module-resolver',
    'metro-react-native-babel-preset',
    'react-native-svg-transformer',
    'typescript',
  ]
  for (const item of Object.keys(pak.devDependencies)) {
    if (devAllowList.includes(item)) {
      npmInstall(`yarn add -D ${item}@${pak.devDependencies[item]} --exact`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
    }
  }
  //console.log(JSON.stringify(pak.devDependencies, undefined, 2))
  /*
  fs.writeFile(
    'app-package.json',
    JSON.stringify({ dependencies: pak.peerDependencies, devDependencies: pak.devDependencies }, undefined, 2),
    'utf8',
    (err) => {
      if (err) {
        console.log('An error occured while writing JSON Object to File.')
        return console.log(err)
      }
      console.log('JSON file has been saved.')
    }
  )
  */
}
module.exports = {
  cli: (_args) => {
    const args = _args.splice(2)
    console.log(args)
    if (args[0] === 'sync-package-json') {
      syncPackageJson()
    }
  },
}
