var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

const float BIAS_PRIMARY = 0.005; // To avoid self-intersection

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	// variables intitialization
	vec3 color = vec3(0,0,0);
	Ray shadowRay;
	vec3 v = normalize(-view);
	vec3 n = normalize(normal);
	vec3 omega;
	vec3 h;
	float cos_theta;
	float cos_fi;


	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows
		shadowRay.dir = normalize(lights[i].position - position);
		shadowRay.pos = position + shadowRay.dir * 0.05;
		HitInfo shadowHit;
		bool isShadowed = false;

		if (IntersectRay(shadowHit, shadowRay)) {
			if (shadowHit.t > 0.0) // True intersection with another object
				isShadowed = true;
		}
		// TO-DO: If not shadowed, perform shading using the Blinn model
		// normalize vectors
		if (!isShadowed) {
			omega = shadowRay.dir;
			h = normalize(omega + v);
			cos_theta = max(dot(n, omega), 0.0);
			cos_fi = max(dot(n, h), 0.0);

			vec3 diffuse  = cos_theta * mtl.k_d;
			vec3 specular = mtl.k_s * pow(cos_fi, mtl.n);

			color += lights[i].intensity * (diffuse + specular);
		}
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30; 
	bool foundHit = false;

	// ray's parameters
	vec3 d = ray.dir;
	vec3 p = ray.pos;

	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
		// I have to solve a quadratic polynomial equation as function of t
		// sphere's parameters
		vec3 center = spheres[i].center;
		float r = spheres[i].radius;

		// coefficients of the quadratic function
		float a = dot(d, d);
		vec3 temp = p-center;
		float b = 2.0 * dot(d, temp);
		float c = dot(temp, temp) - r*r;

		float delta = b*b - (4.0 * a * c);
		if (delta < 0.0) continue; // no intersection
		// TO-DO: If intersection is found, update the given HitInfo

        float sq = sqrt(delta);
        float t1 = (-b - sq) / (2.0 * a);
        float t2 = (-b + sq) / (2.0 * a);
        float t  = (t1 > 0.0) ? t1 : ((t2 > 0.0) ? t2 : -1.0);
    
		if (t > 0.0 && t < hit.t){
			foundHit = true;
			hit.t = t;
			hit.position = p + d*t;
			hit.normal = normalize(hit.position - center);
			hit.mtl = spheres[i].mtl;
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.dir = normalize(2.0 * dot(view, hit.normal) * hit.normal - view);
			r.pos = hit.position + normalize(hit.normal) * 0.001;
			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				view = normalize( -r.dir);
				clr += k_s * Shade( h.mtl, h.position, h.normal, view );
				// TO-DO: Update the loop variables for tracing the next reflection ray
				hit = h;
				k_s *= hit.mtl.k_s;
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;