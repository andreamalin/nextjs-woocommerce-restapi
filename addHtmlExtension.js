const fs = require('fs');
const path = require('path');

// Specify the build output directory (adjust it if needed)
const buildDirectory = './out';

// Traverse the build output directory recursively
function traverseDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const isDirectory = fs.lstatSync(filePath).isDirectory();

    if (isDirectory) {
      traverseDirectory(filePath);
    } else {
      if (filePath.endsWith('.html')) {
        const directoryPath = path.dirname(filePath);
        const filenameWithoutExtension = path.basename(filePath, '.html');
        const hasHTMLFile = fs.existsSync(path.join(directoryPath, `${filenameWithoutExtension}.html`));

        if (hasHTMLFile) {
          // Read the HTML file
          let html = fs.readFileSync(filePath, 'utf8');

          // Replace hrefs without file extension with the updated version
          html = html.replace(/(href="[^".]+)(?<!\.[a-zA-Z]+)"/g, '$1.html"');

          // Write the updated HTML file
          fs.writeFileSync(filePath, html, 'utf8');
        }
      }
    }
  });
}

// Start traversing the build directory
traverseDirectory(buildDirectory);
