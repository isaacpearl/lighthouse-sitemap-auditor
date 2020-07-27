// index.js

const { spawn } = require('child_process');
const xml2js = require('xml2js');
const fs = require('fs');
const cliArgs = process.argv.slice(2);

const getPages = (xmlPath) => {
  const parser = new xml2js.Parser();
  const pages = [];
  const xmlString = fs.readFileSync(xmlPath, "utf8", 
    (data, err) => {
      if(err) {
        console.error(err);
      }
    });

  parser.parseString(xmlString, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      result.urlset.url.forEach((entry) => {
        pages.push(entry.loc[0]);
      });
    }
  });
  return pages;
};

const getBatchResults =(xmlPath) => {
  const pages = getPages(xmlPath);
  const pagesArgString = pages.join();
  console.log(pagesArgString);
  const lb = spawn('lighthouse-batch', ['-h','-s', pagesArgString]);
  lb.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  lb.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  lb.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

const sitemapPath = cliArgs[0];
getBatchResults(sitemapPath);
