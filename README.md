This app converts an image into a series of Minecraft Block Ids

It also generates a Minecraft palette optimzed image, mapping RGB colors to Minecraft Block Ids that are closest in color.

An example of running the app is:

  node app.js images/test.png -s 30  

which

- dumps the image to a shorter, 2d javascript array: (output_2d_array.js)
- dumps the image to a pretty printed javascript array: (output.js)

I then use this with the simple scriptcraft module :

  scriptcraft/image_to_wall.js

To use this, you need to [install node](https://nodejs.org/download/)