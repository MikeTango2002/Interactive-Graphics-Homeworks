// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{	
	let arr = new Array(9);
	arr[0] = Math.cos(rotation * Math.PI/180) * scale;
	arr[1] = Math.sin(rotation* Math.PI/180) * scale;
	arr[2] = 0;
	arr[3] = Math.sin(-rotation* Math.PI/180) * scale;
	arr[4] = Math.cos(rotation* Math.PI/180) * scale;
	arr[5] = 0;
	arr[6] = positionX;
	arr[7] = positionY;
	arr[8] = 1;

	return arr;
	
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans2 and then trans1.
function ApplyTransform( trans1, trans2)
{
	let arr = new Array(9);
	arr[0] = trans2[0] * trans1[0] + trans2[3] * trans1[1] + trans2[6] * trans1[2];
	arr[1] = trans2[1] * trans1[0] + trans2[4] * trans1[1] + trans2[7] * trans1[2];
	arr[2] = trans2[2] * trans1[0] + trans2[5] * trans1[1] + trans2[8] * trans1[2];
	arr[3] = trans2[0] * trans1[3] + trans2[3] * trans1[4] + trans2[6] * trans1[5];
	arr[4] = trans2[1] * trans1[3] + trans2[4] * trans1[4] + trans2[7] * trans1[5];
	arr[5] = trans2[2] * trans1[3] + trans2[5] * trans1[4] + trans2[8] * trans1[5];
	arr[6] = trans2[0] * trans1[6] + trans2[3] * trans1[7] + trans2[6] * trans1[8];
	arr[7] = trans2[1] * trans1[6] + trans2[4] * trans1[7] + trans2[7] * trans1[8];
	arr[8] = trans2[2] * trans1[6] + trans2[5] * trans1[7] + trans2[8] * trans1[8];

	return arr;
}
