var fs = require('fs');
var exec = require('child_process').exec;
var rgbMapping = require('./rgb_mapping').rgbMapping;
var getPixels = require("get-pixels");
var arrayToPng = require("./arrayToPng").arrayToPng;

var MinecraftImagizer = function(inputFilename, outputFilename) {
  if (!inputFilename) {
    this._error('No inputFilename given');
  } else if (!fs.existsSync(inputFilename)) {
    this._error('No file found:' + inputFilename);
  }
  this.inputFilename = inputFilename;
  this.outputFilename = outputFilename || inputFilename.replace(/(\..+)/, ".minecrafted$1");
};

MinecraftImagizer.prototype.generate = function(options, doneCallback) {
  if (!this.dimensions || !this.type) {
    this.getImageInformation(function() { this.generate(options, doneCallback); }.bind(this));
  } else {
    this._process(this._getSettings(options), doneCallback);
  }
};

MinecraftImagizer.prototype.getImageInformation = function(callback) {
  exec('identify -format \'%wx%h %m %b %n\n\' ' + this.inputFilename, function(err, stdout, stderr) {
    var info = stdout.replace(/\n+$/, '').split('\n').reverse()[0].split(' ');
    if (!err && info) {
      this.dimensions = info[0];
      this.type = info[1].toLowerCase();
      this.size = info[2];
      this.frames = info[3];
      callback.call(this);
    } else {
      this._error('Failed to get image information.', err);
    }
  }.bind(this));
};

MinecraftImagizer.prototype._process = function(settings, doneCallback) {
  var params = this._getParamsForConvert(settings);
  var cmd = 'convert ' + params;
  console.log(cmd);
  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      this._error('Could not minecraftize image', err);
    } else {
      this._finish(doneCallback);
    }
  }.bind(this));
};

MinecraftImagizer.prototype.generateScript = function(pixels, info) {
  var MinecraftImage = require('./minecraft_image.js').MinecraftImage;
  var mi = new MinecraftImage();
  var a2png = new arrayToPng();

  a2png.generate(pixels, mi);
  //this.dump(pixels, info);
};

MinecraftImagizer.prototype.dump = function(pixels, info) {
  var xMax = pixels.shape[0];
  var yMax = pixels.shape[1];

  for (var x=0; x < xMax; x++)
  {
    for (var y=0; y < yMax; y++)
    {
      var r = pixels.get(x,y,0);
      var g = pixels.get(x,y,1);
      var b = pixels.get(x,y,2);
      var a = pixels.get(x,y,3);
      if (r === 0 && g === 0 && b === 0)
        continue;
      console.log([r,g,b,a]);
    }
  }

  console.log("info:" + info);
};

MinecraftImagizer.prototype._finish = function(doneCallback) {
    getPixels(this.outputFilename, function(err, pixels) {
        if (err) {
          console.log("Bad image path:" + err);
          return;
        }
        this.generateScript(pixels, pixels.shape.slice()); 
    }.bind(this));
  doneCallback();
};

MinecraftImagizer.prototype._getSettings = function(options) {
  var settings = {
    scale: parseInt(options.scale, 10) || 10,
    coords: null
  };

  if (options.coords) {
    settings.coords = options.coords;
  }

  return settings;
};

MinecraftImagizer.prototype._getParamsForConvert = function(settings) {
  var inputFilename = this.inputFilename;
  var outputFilename = this.outputFilename;
  var table ='./colortable_minecraft.png';
  var params = [inputFilename, '-dither None -remap', table, outputFilename];
  //convert $PIXELATED -dither None -remap $TABLE $MINECRAFTED && open $MINECRAFTED
  var result = params.join(' ');
  return result;
};

MinecraftImagizer.prototype._error = function(message, error) {
  throw new Error(message + ", " + error);
};

exports.MinecraftImagizer = MinecraftImagizer;
