/**
 * AURA Background Animation
 * 基于 AURA SSO 设计的 Three.js 参数化背景动画
 */

(function() {
    'use strict';

    // 容器
    const container = document.getElementById('webgl-container');
    if (!container) return;

    // 场景
    const scene = new THREE.Scene();

    // 正交相机
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 几何体
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Vertex Shader
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    // Fragment Shader
    const fragmentShader = `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform vec3 u_colorCore;
        uniform vec3 u_colorFringe;
        uniform float u_isLightMode;
        varying vec2 vUv;

        // Simple 2D Noise function
        vec2 hash(vec2 p) {
            p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
            return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise(vec2 p) {
            const float K1 = 0.366025404;
            const float K2 = 0.211324865;
            vec2 i = floor(p + (p.x + p.y) * K1);
            vec2 a = p - i + (i.x + i.y) * K2;
            vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec2 b = a - o + K2;
            vec2 c = a - 1.0 + 2.0 * K2;
            vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
            vec3 n = h * h * h * h * vec3(
                dot(a, hash(i + 0.0)),
                dot(b, hash(i + o)),
                dot(c, hash(i + 1.0))
            );
            return dot(n, vec3(70.0));
        }

        // Signed distance function for a sweeping arc/curve
        float sdArc(vec2 p, vec2 center, float radius, float width, float warp) {
            p.y += sin(p.x * 3.0 + u_time * 0.5) * warp;
            p.x += noise(p * 2.0 + u_time * 0.2) * (warp * 0.5);
            float d = length(p - center) - radius;
            return abs(d) - width;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 st = uv;
            st.x *= u_resolution.x / u_resolution.y;

            vec2 mouseOffset = (u_mouse - 0.5) * 0.1;
            st += mouseOffset;

            vec2 center = vec2(0.2, 0.5);

            float d1 = sdArc(st, center, 0.8, 0.01, 0.1);
            float d2 = sdArc(st, center, 0.82, 0.04, 0.15);

            float coreGlow = exp(-d1 * 40.0);
            float fringeGlow = exp(-d2 * 15.0);

            float wash = smoothstep(1.0, -0.2, st.x) * 0.3;

            vec3 finalColor = vec3(0.0);

            finalColor += u_colorCore * coreGlow;
            finalColor += u_colorFringe * fringeGlow;
            finalColor += u_colorFringe * wash * (sin(u_time) * 0.1 + 0.9);

            float alpha = clamp(coreGlow + fringeGlow + wash, 0.0, 1.0);

            finalColor = vec3(1.0) - exp(-finalColor * 2.0);

            if (u_isLightMode > 0.5) {
                alpha = clamp((coreGlow * 1.5 + fringeGlow + wash * 0.5), 0.0, 0.6);
            }

            gl_FragColor = vec4(finalColor, alpha);
        }
    `;

    // 获取计算颜色
    function getComputedColors() {
        const styles = getComputedStyle(document.documentElement);
        return {
            core: new THREE.Color(styles.getPropertyValue('--shader-core').trim() || '#FFFFFF'),
            fringe: new THREE.Color(styles.getPropertyValue('--shader-fringe').trim() || '#4A88FF')
        };
    }

    // 创建材质
    const initialColors = getComputedColors();
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_colorCore: { value: initialColors.core },
            u_colorFringe: { value: initialColors.fringe },
            u_isLightMode: { value: document.documentElement.getAttribute('data-theme') === 'light' ? 1.0 : 0.0 }
        },
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 鼠标跟踪
    let targetMouse = new THREE.Vector2(0.5, 0.5);
    document.addEventListener('mousemove', (e) => {
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
    });

    // 时钟
    const clock = new THREE.Clock();

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        material.uniforms.u_time.value = elapsedTime;
        material.uniforms.u_mouse.value.lerp(targetMouse, 0.05);

        renderer.render(scene, camera);
    }
    animate();

    // 窗口大小调整
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);
        material.uniforms.u_resolution.value.set(width, height);
    });

    // 主题切换监听
    window.updateAuraTheme = function() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const colors = getComputedColors();

        material.uniforms.u_colorCore.value = colors.core;
        material.uniforms.u_colorFringe.value = colors.fringe;
        material.uniforms.u_isLightMode.value = isLight ? 1.0 : 0.0;
    };

    // 性能优化：页面不可见时降低帧率
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            renderer.setAnimationLoop(null);
        } else {
            animate();
        }
    });

})();
