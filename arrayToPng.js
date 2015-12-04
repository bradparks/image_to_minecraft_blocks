var fs = require("fs");
var Buffer = require("buffer").Buffer;
var PNG = require("pngjs2").PNG;
var exec = require('child_process').exec;

var arrayToPng = function() {
};

arrayToPng.prototype.flipOutput = function(callback)
{
  var params = "output.png -transpose output_new.png";
  var cmd = 'convert ' + params;
  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      this._error('Couldnt flip image', err);
    } else {
      callback();
    }
  }.bind(this));
}

arrayToPng.prototype.generate = function(pixels, rgbToBlock)
{
  var IMAGE_WIDTH = pixels.shape[0];
  var IMAGE_HEIGHT = pixels.shape[1];
  var rgb_data = new PNG({width:IMAGE_WIDTH,height:IMAGE_HEIGHT});
  var out = "var data = [";

  var data = [];

  for (var x=0; x < IMAGE_WIDTH; x++)
  {
    var row = [];
    out += "[";
    for (var y=0; y < IMAGE_HEIGHT; y++)
    {
      var r = pixels.get(x,y,0);
      var g = pixels.get(x,y,1);
      var b = pixels.get(x,y,2);
      var a = pixels.get(x,y,3);

      var p = (rgb_data.width * x + y) << 2;
      rgb_data.data[p + 0] = r; // r (0-255)
      rgb_data.data[p + 1] = g; // g (0-255)
      rgb_data.data[p + 2] = b; // b (0-255)
      rgb_data.data[p + 3] = a; // b (0-255)

      var c = {r:r, g:g, b:b};
      var closest = rgbToBlock.findClosestColor(c);

      var blockId = closest.color.id;
      out += "[" + blockId.join(",") + "]";
      if (y != IMAGE_HEIGHT - 1)
      {
        out += ",";
      }
      row.push(blockId);
    }
    data.push(row);
    if (x != IMAGE_WIDTH - 1)
    {
      out += "],";
    }
    else
    {
      out += "]";
    }
    out += "\n";
  }
  out += "];";

  var outputFilename = 'output_2d_array.js';
  fs.writeFile(outputFilename, out, function(err) {
    if(err) { throw err; }
  });
  console.log("JSON saved to " + outputFilename);

  outputFilename = 'output.js';
  fs.writeFile(outputFilename, JSON.stringify(data, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + outputFilename);
      }
  }); 

  outputFilename = __dirname + '/output.png';
  rgb_data.pack()
    .pipe(fs.createWriteStream(outputFilename))
    .on('finish', function() {
      this.flipOutput(function() {
        console.log('Sample image saved to ' + outputFilename);
      });
    }.bind(this));
};

exports.arrayToPng = arrayToPng;
