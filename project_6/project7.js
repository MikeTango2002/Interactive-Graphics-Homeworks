// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var rotationAxesX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), -Math.sin(rotationX), 0,
		0, Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1

	];

	var rotationAxesY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1

	]

	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rotations = MatrixMult(rotationAxesY, rotationAxesX);
	
	var mv = MatrixMult(trans, rotations);

	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		// Compile the shader program
		this.prog = InitShaderProgram( meshVS, meshFS );
		
		// Get the ids of the uniform variables in the shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' ); // This variable stores the ModelViewProjection transformation matrix
		this.mv = gl.getUniformLocation( this.prog, 'mv');   // This variable stores the ModelView transformation matrix
		this.mnr = gl.getUniformLocation( this.prog, 'mnr'); // This variable stores the MatrixNormal transformation
		
		// Get the ids of the vertex attributes in the shaders
		this.vertPos = gl.getAttribLocation( this.prog, 'pos' );
		this.texCoords = gl.getAttribLocation(this.prog, 'txc');
		this.normals = gl.getAttribLocation(this.prog, 'nrm');
		
		// Create the buffer objects
		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();
		this.normalsbuffer = gl.createBuffer();

		this.u_swapYZ = gl.getUniformLocation(this.prog, 'u_swapYZ');


		this.alpha = gl.getUniformLocation(this.prog, 'alpha'); // Exponent alpha of the Blinn material model
		this.light_dir = gl.getUniformLocation(this.prog, 'light_dir'); // Light direction in camera space
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		this.numVertices = vertPos.length;
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);


		// Unbind the gl.ARRAY_BUFFER buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader

		gl.useProgram(this.prog);
		if (swap == true){
			gl.uniform1i(this.u_swapYZ, true);
		}
		else{
			gl.uniform1i(this.u_swapYZ, false);
		}
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv( this.mvp, false, matrixMVP);
		gl.uniformMatrix4fv( this.mv, false, matrixMV);
		gl.uniformMatrix3fv( this.mnr, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertPos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.vertexAttribPointer(this.texCoords, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.texCoords);	

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsbuffer);
		gl.vertexAttribPointer(this.normals, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normals);


		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		this.texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		gl.generateMipmap(gl.TEXTURE_2D);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			gl.LINEAR
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.LINEAR_MIPMAP_LINEAR
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			gl.REPEAT
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			gl.REPEAT
		);


		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.

		gl.useProgram(this.prog);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		this.u_showTex = gl.getUniformLocation(this.prog, 'u_showTex');
		this.sampler = gl.getUniformLocation(this.prog, 'tex');

		gl.uniform1i(this.u_showTex, true);
		gl.uniform1i(this.sampler, 0);

	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		if(show == true){
			gl.useProgram(this.prog);
			gl.uniform1i(this.u_showTex, true);
		}

		else{
			gl.useProgram(this.prog);
			gl.uniform1i(this.u_showTex, false);
		}
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		let light_dir = new Float32Array([x, y, z]);

	    // Normalize the light direction
		let length = Math.sqrt(light_dir[0] * light_dir[0] + light_dir[1] * light_dir[1] + light_dir[2] * light_dir[2]);
		light_dir[0] /= length;
		light_dir[1] /= length;
		light_dir[2] /= length;

		light_dir[1] = -light_dir[1];

	
		gl.useProgram(this.prog);
		gl.uniform3fv(this.light_dir, light_dir);

	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.alpha, shininess);
	}
}



// Vertex shader source code
var meshVS = `
	attribute vec3 pos;
	attribute vec2 txc;
	attribute vec3 nrm;
	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat3 mnr;
	varying vec2 texCoord;

	uniform bool u_swapYZ;

	varying vec3 camPos;
	varying vec3 camNorm;

	void main()
	{	
		vec3 pos_copy = pos;
		vec3 nrm_copy = nrm;

		if(u_swapYZ){
			float temp = pos_copy.y;
			pos_copy.y = pos_copy.z;
			pos_copy.z = temp;

			temp = nrm_copy.y;
			nrm_copy.y = nrm_copy.z;
			nrm_copy.z = temp;
		}

		camPos = (mv * vec4(pos_copy, 1)).xyz;
		camNorm = normalize(mnr * nrm_copy);

		gl_Position = mvp * vec4(pos_copy,1);
		texCoord = txc;

	}
`;
// Fragment shader source code
var meshFS = `
	precision mediump float;
	uniform sampler2D tex;
	varying vec2 texCoord;

	varying vec3 camPos;
	varying vec3 camNorm;

	uniform bool u_showTex;

	uniform float alpha;
	uniform vec3 light_dir;

	void main()
	{	

		vec3 viewDir = normalize(-camPos);

		vec3 intensity = vec3(1.0, 1.0, 1.0);

		vec3 Ks = vec3(1.0, 1.0, 1.0);

		vec3 Kd = vec3(1.0, 1.0, 1.0);

		float opacity = 1.0;


		if(u_showTex){	

			vec3 texColor = texture2D(tex, texCoord).rgb;
			Kd = texColor;
			opacity = texture2D(tex, texCoord).a;
		}

		//float cos_theta = (camNorm.x * light_dir.x) + (camNorm.y * light_dir.y) + (camNorm.z * light_dir.z);
		float cos_theta = max(dot(camNorm, light_dir), 0.0);

		vec3 h = normalize(light_dir + viewDir);

		//float cos_fi = (camNorm.x * h.x) + (camNorm.y * h.y) + (camNorm.z * h.z);
		float cos_fi = max(dot(camNorm, h), 0.0);

		vec3 diffuse = cos_theta * Kd;
		vec3 specular = Ks * pow(cos_fi, alpha);

		vec3 blinn_reflection_model = 0.1*Kd + intensity * (diffuse + specular);

		gl_FragColor = vec4(blinn_reflection_model, opacity);
		
	}
`;



// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	var forces = Array( positions.length ); // The total for per particle

	// [TO-DO] Compute the total force of each particle
	
	// [TO-DO] Update positions and velocities
	
	// [TO-DO] Handle collisions
	
}

