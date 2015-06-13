var rgb_map = require('./rgb_mapping').rgbMapping;

function MinecraftImage()
{
}

MinecraftImage.prototype.diffBetweenColors = function(col1,col2) 
{
  delta_r = col2.r - col1.r;
  delta_g = col2.g - col1.g;
  delta_b = col2.b - col1.b;

  var result = delta_r*delta_r + delta_g*delta_g + delta_b*delta_b;

  return result;
};

MinecraftImage.prototype.diffBetweeColorsEx = function(col1,col2) 
{
  delta_r = col2.r - col1.r;
  delta_g = col2.g - col1.g;
  delta_b = col2.b - col1.b;

  var r_factor = 0.299;
  var g_factor = 0.587;
  var b_factor = 0.114;

  var result = (delta_r*delta_r*r_factor) + (delta_g*delta_g*g_factor) + (delta_b*delta_b*b_factor);

  return result;
};

MinecraftImage.prototype.findClosestColor = function(c)
{
  var result = {};
  result.dist = Number.MAX_VALUE;
  result.success = false;

  for (var i = 0; i < rgb_map.length; i++) 
  {
    var currColor = rgb_map[i];
    var dist = this.diffBetweenColors(c, currColor);

    if (dist < result.dist)
    {
      result.index = i;
      result.color = currColor;

      result.dist = dist;
      result.success = true;
    }
  }

  return result;
};

MinecraftImage.prototype.uid = function() {
    return new Date().getTime();
};

MinecraftImage.prototype.clone = function(obj) {
    if(obj === null || typeof(obj) !== 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            temp[key] = this.clone(obj[key]);
        }
    }
    return temp;
};

MinecraftImage.prototype.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

MinecraftImage.prototype.hello = function() {
  return "world";
};

MinecraftImage.prototype.testCountAndOffset = function(count, rgbOffset)
{
  for (var i=1; i < count; i++)
  {
    var index = this.getRandomInt(0, rgb_map.length-1);
    colorToFind = this.clone(rgb_map[index]);

    colorToFind.r = (rgbOffset.r !== undefined ? rgbOffset.r : colorToFind.r);
    colorToFind.g = (rgbOffset.g !== undefined ? rgbOffset.g : colorToFind.g);
    colorToFind.b = (rgbOffset.b !== undefined ? rgbOffset.b : colorToFind.b);

    result = this.findClosestColor(colorToFind);
    if (result.dist > 0)
    {
      console.log("PROBLEM");
      console.log([result.dist, result.color.name ]);
    }
  }

  console.log('done' + this.uid());
};


// Node: Export function
if (typeof module !== "undefined" && module.exports) {
    exports.MinecraftImage = MinecraftImage;
}
// AMD/requirejs: Define the module
else if (typeof define === 'function' && define.amd) {
    define(function () {return MinecraftImage;});
}
// Browser: Expose to window
else {
    window.MinecraftImage = MinecraftImage;
}
