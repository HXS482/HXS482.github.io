const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    varying vec2 vUv;

    // Simplex noise implementation
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,
                            0.366025403784439,
                           -0.577350269189626,
                            0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    // Fractal Brownian Motion
    float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 5; ++i) {
            v += a * snoise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = (vUv - 0.5) * 2.0;
        uv.x *= u_resolution.x / u_resolution.y;

        vec2 mouseOffset = (u_mouse - 0.5) * 0.5;

        float dist = length(vec2(uv.x - mouseOffset.x * 0.2, (uv.y - mouseOffset.y * 0.2) * 0.6));

        vec2 q = vec2(0.);
        q.x = fbm( uv + 0.00 * u_time);
        q.y = fbm( uv + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm( uv + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time );
        r.y = fbm( uv + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);

        float f = fbm(uv + r);

        float core = smoothstep(0.8, 0.0, dist + f * 0.3);

        vec3 voidBlack = vec3(0.01, 0.01, 0.01);
        vec3 haloOrange = vec3(0.85, 0.42, 0.15);
        vec3 coreWhite = vec3(1.0, 0.97, 0.88);

        vec3 color = mix(voidBlack, haloOrange, smoothstep(0.1, 0.6, core));
        color = mix(color, coreWhite, smoothstep(0.5, 0.9, core));

        color += haloOrange * f * 0.1 * smoothstep(1.0, 0.2, dist);

        gl_FragColor = vec4(color, 1.0);
    }
`;

const container = document.getElementById('glcanvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);

const uniforms = {
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
};

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

const coordsDisplay = document.getElementById('coords');

window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = 1.0 - (e.clientY / window.innerHeight);

    uniforms.u_mouse.value.x += (x - uniforms.u_mouse.value.x) * 0.05;
    uniforms.u_mouse.value.y += (y - uniforms.u_mouse.value.y) * 0.05;

    if (coordsDisplay) {
        coordsDisplay.textContent = `TRGT: ${x.toFixed(3)}, ${y.toFixed(3)}`;
    }
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
}

animate();
