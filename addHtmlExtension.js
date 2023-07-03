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
          addb2Apis(filePath)
        }
      }
    }
  });
}

function addb2Apis(filePath) {
  // Read the content of index.html
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // Find the position to insert the new script tags
    const position = data.lastIndexOf('<head>');

    // Construct the new content with the added script tags
    let updatedContent = data.slice(0, position) +
      '<script type="text/javascript" src="$B2BAPIS/b2bapis/b2bapis.js"></script>\n' +
      '<script type="text/javascript" src="$WEBAPIS/webapis/webapis.js"></script>\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />\n' +
      data.slice(position);

      updatedContent = updatedContent.replace('<meta name="viewport" content="width=device-width"/>', '')

    // Find the position to insert the new script tags
    const position2 = updatedContent.lastIndexOf('</script>');
    // Construct the new content with the added script tags
    updatedContent = updatedContent.slice(0, position2) +
      '</script><script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>\n' +
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/jQuery-slimScroll/1.3.8/jquery.slimscroll.min.js"></script>\n' +
      '<script> $(document).ready(function() { $("#scrollContainer").slimScroll({ height: "100%", railVisible: true, alwaysVisible: true, wheelStep: 20  }); }); </script>\n' +
      updatedContent.slice(position2);


    // Write the updated content back to index.html
    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Script tags added to index.html successfully!');
    });
  });
}

// Start traversing the build directory
traverseDirectory(buildDirectory);
