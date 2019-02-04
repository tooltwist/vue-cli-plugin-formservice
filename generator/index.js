module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    dependencies: {
      "vue-formservice": "^0.1.76"
    },
  });

  /*
   *  Create example page.
   */
  api.render('./template')


  /*
   *  Update main.js or main.ts
   */
  let importCode = `\nimport FormService from 'vue-formservice';\n`

  let initializationCode = `\nVue.use(FormService, { });\n`

  api.onCreateComplete(() => {

    console.log(`\nIn api.onCreateComplete`);

    // copy and render all files in ./template with ejs
    api.render('./template')

    /*
     *  Inject initialization into main.js
     */
    const fs = require('fs');
    const ext = api.hasPlugin('typescript') ? 'ts' : 'js';
    const mainPath = api.resolve(`./src/main.${ext}`);

    // Read the file.
    let contentMain = fs.readFileSync(mainPath, { encoding: 'utf-8' });

    // Check we have Contentservice installed
    if (contentMain.indexOf(`from 'vue-contentservice'`) < 0) {
      console.log(`Please install @tooltwist/vue-contentservice first.`);
      console.log(`You can do this by running:`);
      console.log();
      console.log(`    vue add contentservice`);
      console.log();
      return
    }

console.log(`Life is good`);

    // Initialize Formservice before Instantiating the App.
    let pos = contentMain.indexOf(`\nnew Vue({`)
    if (pos < 0) {
      console.log(`Cannot find 'new Vue(...)' in main.${ext}`);
      console.log(`Install did not succeed.`);
      return
    }
    let before = contentMain.substring(0, pos)
    let after = contentMain.substring(pos)
    contentMain = before + initializationCode + after


    // Add our import code after the last import statement
    const lines = contentMain.split(/\r?\n/g).reverse();
    const lastImportIndex = lines.findIndex(line => line.match(/^import/));
    lines[lastImportIndex] += importCode;

    // Write the file back.
    contentMain = lines.reverse().join('\n');
    fs.writeFileSync(mainPath, contentMain, { encoding: 'utf-8' });
  });

}
