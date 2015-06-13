/* forked from https://github.com/brandonaaron/pixelator 
 * Thanks!
 * */

var fs = require('fs');
var exec = require('child_process').exec;

var Pixelator = function(path) {
  if (!path) {
    this._error('No path given');
  } else if (!fs.existsSync(path)) {
    this._error('No file found');
  }
  this.path = path;
  this.pixelatedPath = path.replace(/(\..+)/, ".pixelated$1");
};

Pixelator.prototype.pixelate = function(options, callback) {
  if (!this.dimensions || !this.type) {
    this.getImageInformation(function() { 
      this.pixelate(options, callback); 
    }.bind(this));
  } else {
    this._process(this._getSettings(options), callback);
  }
};

Pixelator.prototype.getImageInformation = function(callback) {
  exec('identify -format \'%wx%h %m %b %n\n\' ' + this.path, function(err, stdout, stderr) {
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

Pixelator.prototype._process = function(settings, callback) {
  var params = this._getParamsForConvert(settings);
  var cmd = 'convert ' + params;
  console.log(cmd);
  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      this._error('Could not pixelate image', err);
    } else {
      this._finish(callback);
    }
  }.bind(this));
};

Pixelator.prototype._finish = function(callback) {
  callback(fs.createReadStream(this.path), this);
};

Pixelator.prototype._getSettings = function(options) {
  var settings = {
    scale: parseInt(options.scale, 10) || 10,
    maxX: options.maxX || null,
    maxY: options.maxY || null,
    coords: null
  };

  if (options.coords) {
    settings.coords = options.coords;
  }

  var bothDimensions = this.dimensions.split("x");
  var xDim = parseInt(bothDimensions[0]);
  var yDim = parseInt(bothDimensions[1]);
  var aspect;
  if (settings.maxY)
  {
    aspect = (xDim/yDim);
    this.dimensions = parseInt(aspect * settings.maxY) + 'x' + settings.maxY;
  }
  else if (settings.maxX)
  {
    aspect = (yDim/xDim);
    this.dimensions = settings.maxX + 'x' + parseInt(aspect * settings.maxX);
  }

  return settings;
};

Pixelator.prototype._getParamsForConvert = function(settings) {
  var params = [this.path],
      partiallyPixelate = !!settings.coords,
      scaleParams = ['-scale', settings.scale + '%', '-filter', 'box', '-resize', this.dimensions + '!'];
  if (partiallyPixelate) {
    params.push('\\( +clone ' + scaleParams.join(' ') + ' \\)');
    params.push("\\( +clone -gamma 0 -fill white -draw 'rectangle " + settings.coords[0].join(',') + " " + settings.coords[1].join(',') + "' \\)");
    params.push("\\( +clone \\) -composite")
  } else {
    params = params.concat(scaleParams);
  }
  params.push(this.pixelatedPath);
  return params.join(' ');
};

Pixelator.prototype._error = function(message, error) {
  throw new Error(message);
};

exports.Pixelator = Pixelator;
