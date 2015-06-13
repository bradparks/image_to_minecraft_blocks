var assert = require('assert');
var fs = require('fs');
var Pixelator = require('./pixelator.js').Pixelator;
var MinecraftImagizer = require('./minecraft_imageizer.js').MinecraftImagizer;
var stdio = require('stdio');

var opts = stdio.getopt({
    _meta_: {minArgs: 1},
    'outputFilename':  {key: 'o', args:1, description:'The file to save the converted file to.'},
    'blocksHigh':      {key: 'h', args:1, default:100, description:'The # of blocks high to scale your image.'},
    'blocksWide':      {key: 'w', args:1, description:'The # of blocks wide to scale your image.'},
    'scale':           {key: 's', args:1, default:30, description:'The bigger this percent, the more blocky things will look.'}
});
opts.inputFilename = opts.args[0];
console.log();
console.log("Using configuration:");
console.log(opts);
console.log();

var pixelator = new Pixelator(opts.inputFilename);
pixelator.type = 'png';

pixelator.pixelate({scale: opts.scale, maxX:opts.blocksWide, maxY:opts.blocksHigh}, function(rs) {
  var minecrafter = new MinecraftImagizer(this.pixelatedPath, opts.outputFilename);
  minecrafter.generate({}, function(rs) {
  }.bind(minecrafter));
}.bind(pixelator));
