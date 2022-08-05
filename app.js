const Window = require('window');
const { Blob } = require('./blob.js');

// globals expected to exist by p5js (must come before the import)
global.window = new Window();
// Override JSDOM's horrible Blob implementations
global.window.Blob = Blob;
global.document = global.window.document;
global.screen = global.window.screen;
global.navigator = global.window.navigator;

// const p5 = require('p5');
const p5 = require('node-p5');



var fs = require('fs');
var es = require('event-stream');

const http = require('http');
// const fs = require('fs');
const readline = require('readline');
// const events = require('events');


// const inst = new p5(p => {
//   p.setup = function() {
//     console.log('rendering');
//     let canvas = p.createCanvas(200, 200);
//     p.background('gray');
//     p.fill('crimson');
//     p.circle(p.width / 2, p.height / 2, 100);
//     canvas.elt.toBlob(
//       data => {
//         let writeStream = fs.createWriteStream('./out.png')
//         writeStream.on('finish', () => {
//           // All writes are now complete.
//           done();
//         });
//         writeStream.on('error', (err) => {
//           console.error(err);
//         });

//         console.log('file size: ' + data.size);
//         writeStream.write(data.arrayBuffer());
//         writeStream.end();
//       },
//       'image/png'
//     );
//   };
// });

// function done() {
//   console.log('done!');
//   inst.remove();
//   process.exit(0);
// }


var totalLines = 0;
var flowData = [];

var s = fs
  .createReadStream('./assets/Qout.csv')
  .pipe(es.split())
  .pipe(
    es
      .mapSync(function(line) {
        totalLines++;
        flowData.push(line);
      })
      .on('error', function(err) {
        console.log('Error while reading file.', err);
      })
      .on('end', function() {
        console.log('Read entire file.');
        console.log(totalLines);
        // console.log(flowData);
      }),
);


// const http = require('http');
// const fs = require('fs');
// const readline = require('readline');
// const events = require('events');


const hostname = '127.0.0.1';
const port = 3000;

// var server;

// fs.readFile('./index.html', function (err, html) {
//     if (err) {
//         throw err; 
//     }       
//     const server = http.createServer(function(request, response) {  
//         response.writeHeader(200, {"Content-Type": "text/html"});  
//         response.write(html);  
//         response.end();  
//     })
//     server.listen(port, hostname, () => {
//         console.log(`Server running at http://${hostname}:${port}/`);
//     });
// });

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  // const file = fs.readFileSync("./assets/Qout.txt", "utf8");
  // file.split(/\r?\n/).forEach(line =>  {
  //   console.log(`Line from file: ${line}`);
  // });
  // (async function processLineByLine() {
  //   try {
  //     const rl = readline.createInterface({
  //       input: fs.createReadStream('./assets/Qout.txt'),
  //       crlfDelay: Infinity
  //     });
      
  //     var rows = [];
  //     rl.on('line', (line) => {
  //       rows.push(`${line}`);
  //       // console.log(`Line from file: ${line}`);
  //       // console.log(rows);
  //     });
  //     // console.log(rows);
  
  //     await events.once(rl, 'close');
  
  //     console.log('Reading file line by line with readline done.');
  //     const used = process.memoryUsage().heapUsed / 1024 / 1024;
  //     console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // })();
  res.end('Hello World');
});


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});