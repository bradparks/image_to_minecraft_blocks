var fs = require("fs");
var Buffer = require("buffer").Buffer;
var Png = require("png").Png;

var arrayToPng = function() {
};

arrayToPng.prototype.generate = function(pixels, rgbToBlock)
{
  var IMAGE_WIDTH = pixels.shape[0];
  var IMAGE_HEIGHT = pixels.shape[1];
  var rgb_data = new Buffer(IMAGE_WIDTH * IMAGE_HEIGHT * 3);
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

      var p = x * IMAGE_WIDTH * 3 + y * 3;
      rgb_data[p + 0] = r; // r (0-255)
      rgb_data[p + 1] = g; // g (0-255)
      rgb_data[p + 2] = b; // b (0-255)

      var c = {r:r, g:g, b:b};
      var closest = rgbToBlock.findClosestColor(c);

      //console.log([closest.color.b, closest.color.b.name]);
      //console.log(closest.color.id, closest.color.name);
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

  var png = new Png(rgb_data, IMAGE_WIDTH, IMAGE_HEIGHT, "rgb");

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

  fs.writeFile("output1.png", png.encodeSync().toString("binary"), "binary", function(err) {
    if(err) { throw err; }
  });
};

arrayToPng.prototype.generate1 = function() 
{
  var IMAGE_WIDTH = 255;
  var IMAGE_HEIGHT = 255;

  var rgb_data = new Buffer(IMAGE_WIDTH * IMAGE_HEIGHT * 3);

  for(var h = 0; h < IMAGE_HEIGHT; h++)
  {
    for(var w = 0; w < IMAGE_WIDTH; w++)
    {
      var p = h * IMAGE_WIDTH * 3 + w * 3;
      rgb_data[p + 0] = h; // r (0-255)
      rgb_data[p + 1] = 0; // g (0-255)
      rgb_data[p + 2] = w; // b (0-255)
    }
  }

  var png = new Png(rgb_data, IMAGE_WIDTH, IMAGE_HEIGHT, "rgb");

  fs.writeFile("output1.png", png.encodeSync().toString("binary"),
               "binary", function(err) {
    if(err) { throw err; }
  });
};

exports.arrayToPng = arrayToPng;
