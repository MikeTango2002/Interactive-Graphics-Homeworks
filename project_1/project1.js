// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{   
    // bgImg and fgImg are both ImageData object.
    // In order to access the pixels of such object, use its "data" property,
    // which is an "Uint8ClampedArray" where every 4 consecutives values represent
    // one pixel in RGBA format.
    // e.g. pixel at index (i): red(i), green(i+1), blue(i+2), alpha(i+3).
    // index of a pixel at (x, y) = (y*width + x) * 4
    console.log(fgOpac);
    let bgWidth = bgImg.width;
    let bgHeight = bgImg.height;

    let fgWidth = fgImg.width;
    let fgHeight = fgImg.height;

    for (let y=0; y < fgHeight; y++) {
        for (let x=0; x < fgWidth; x++){

            let currentPos = {
                x: fgPos.x + x, // Add x values
                y: fgPos.y + y  // Add y values
              };
            if (currentPos.x < 0 || currentPos.x >= bgWidth || currentPos.y < 0 || currentPos.y >= bgHeight)
                continue;   
            
            let bgIndex = (currentPos.y*bgWidth + currentPos.x) * 4;
            let fgIndex = (y*fgWidth + x) * 4;

            // alpha in stored between 0 and 255 into the array: I have to normalize it between 0 and 1
            let bgAlpha = bgImg.data[bgIndex + 3] / 255;
            let fgAlpha = fgImg.data[fgIndex+ 3] * fgOpac / 255;
            let alpha = fgAlpha + (1 - fgAlpha) * bgAlpha;

            bgImg.data[bgIndex + 0] = (fgAlpha * fgImg.data[fgIndex + 0] + (1-fgAlpha) * bgAlpha * bgImg.data[bgIndex + 0]) / alpha;
            bgImg.data[bgIndex + 1] = (fgAlpha * fgImg.data[fgIndex + 1] + (1-fgAlpha) * bgAlpha * bgImg.data[bgIndex + 1]) / alpha;
            bgImg.data[bgIndex + 2] = (fgAlpha * fgImg.data[fgIndex + 2] + (1-fgAlpha) * bgAlpha * bgImg.data[bgIndex + 2]) / alpha;
            bgImg.data[bgIndex + 3] = alpha * 255; // I restore the value of alpha between 0 and 255

        }
    }
}
