/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

function copyFileSync( source, target ) {

  const targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if ( fs.existsSync( target ) ) {
      if ( fs.lstatSync( target ).isDirectory() ) {
          targetFile = path.join( target, path.basename( source ) );
      }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function listFilesRecursive( root, sourceDir ) {
  const output = []
  const source = sourceDir || root;

  // Copy
  if ( fs.lstatSync( source ).isDirectory() ) {
      const files = fs.readdirSync( source )
      for (const file of files) {
        var curSource = path.join( source, file );
        output.push(...listFilesRecursive( root, curSource ))
      }
  } else{
    const _src = path.relative(root, source).split(path.sep).join(path.posix.sep)
    output.push({src: _src, dst: _src })
  }
  return output
}

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
  const lockedDependencies = execSync('npm ls --package-lock-only', { cwd: __dirname })
    .toString()
    .trim()
    .split('\n')
    .splice(1)
    .map((item) => {
      return item.substring(4)
    })
    .reduce((prev, val) => {
      const [name, version] = parseNameAndVersion(val)
      prev[name] = version
      return prev
    }, {})

  //const peerDependencies = pak.peerDependencies
  //console.log(`peerDependencies:${ Object.keys(pak.peerDependencies).length}`)
  for (const item of Object.keys(pak.peerDependencies)) {
    pak.peerDependencies[item] = '' + lockedDependencies[item]
  }
  console.log(JSON.stringify(pak.peerDependencies, undefined, 2))

  //console.log(`devDependencies:${ Object.keys(pak.devDependencies).length}`)
  for (const item of Object.keys(pak.devDependencies)) {
    if (pak.devDependencies[item].startsWith('npm:')) {
      const curVersion = pak.devDependencies[item]
      const [name] = parseNameAndVersion(curVersion)
      pak.devDependencies[item] = name + '@' + lockedDependencies[item + '@' + name]
    } else {
      pak.devDependencies[item] = '' + lockedDependencies[item]
    }
  }
  console.log('Installing Dependencies ...')
  for (const item of Object.keys(pak.peerDependencies)) {
    npmInstall(`npm install ${item}@${pak.peerDependencies[item]} --force --save-exact`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
  }
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
      npmInstall(`npm install -D ${item}@${pak.devDependencies[item]} --force --save-exact`, {
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
async function generateAppBoilerplace(args) {
  const { once } = require('events');
  const readline = require('readline');
  const sourceDir = path.resolve(__dirname, './template')
  const app = require(path.resolve(process.cwd(), 'app.json'))
  const copySpecs = listFilesRecursive(sourceDir)
  .map((item)=>{
    item.dst = item.dst.replace(new RegExp('^android/app/src/main/java/com/ariesbifold/'), `android/app/src/main/java/${app.package.split('.').join('/')}/`)
    item.dst = item.dst.replace(new RegExp('^android/app/src/debug/java/com/ariesbifold/'), `android/app/src/debug/java/${app.package.split('.').join('/')}/`)
    if (item.dst.startsWith('ios/')) {
      item.dst = item.dst.replace(new RegExp('AriesBifold', 'g'), app.name)
    }
    return item
  })
  
  const targetDir =  path.resolve(process.cwd())
  for (const copySpec of copySpecs) {
    const srcPath = path.join(sourceDir, copySpec.src)
    const dstPath = path.join(targetDir, copySpec.dst)
    const dstDirPath = path.dirname(dstPath)
    if (!fs.existsSync(dstDirPath)) {
      fs.mkdirSync(dstDirPath, {recursive: true})
    }
    if (
      copySpec.src.endsWith('.java') || 
      copySpec.src.endsWith('strings.xml') || 
      copySpec.src.endsWith('.gradle') || 
      copySpec.src.endsWith('BUCK') || 
      copySpec.src.endsWith('AndroidManifest.xml') ||
      (copySpec.src.endsWith('Info.plist') && !copySpec.src.endsWith('Indy.framework/Info.plist')) ||
      copySpec.src.endsWith('AppDelegate.m') ||
      copySpec.src.endsWith('Podfile') ||
      copySpec.src.endsWith('ios/AriesBifold.xcodeproj/xcshareddata/xcschemes/AriesBifold.xcscheme') ||
      copySpec.src.endsWith('ios/AriesBifold.xcworkspace/contents.xcworkspacedata') ||
      copySpec.src.endsWith('project.pbxproj')
    ) {
      var outputSream = fs.createWriteStream(dstPath, {
        flags: 'w'
      })
      const rl = readline.createInterface({
        input: fs.createReadStream(srcPath),
        terminal: false
      });
      rl.on('line', (line) => {
        outputSream.write(line.toString().replace(new RegExp('com\.ariesbifold'), app.package).replace(new RegExp('org\.reactjs\.native\.example\.AriesBifold'), app.package).replace(new RegExp('aries-bifold'), app.name).replace(new RegExp('(?<!-)AriesBifold(?!-)'), app.name).replace(new RegExp('Aries Bifold'), app.displayName) + "\n")
      });
      await once(rl, 'close');
      outputSream.end()
      outputSream.close()
      //fs.copyFileSync(srcPath, dstPath)
    }else {
      fs.copyFileSync(srcPath, dstPath)
    }
  }
}

module.exports = {
  cli: (_args) => {
    const args = _args.splice(2)
    console.log(args)
    if (args[0] === 'sync-package-json') {
      syncPackageJson()
    } else if (args[0] === 'generate-app-boilerplate') {
      generateAppBoilerplace(args.splice(1))
    } else if (args[0] === 'install-indy-sdk') {
      const androidLibFiles = listFilesRecursive(path.resolve(__dirname, '../app/android/app/src/main/jniLibs'))
      const iosLibFiles = listFilesRecursive(path.resolve(__dirname, '../app/ios/Pods/Frameworks'))
      //console.log(`process.cwd(): ${process.cwd()}`)
      console.dir(androidLibFiles)
      console.dir(iosLibFiles)
    }
  },
}
