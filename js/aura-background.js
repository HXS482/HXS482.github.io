/**
 * AURA Background Animation - Optimized
 * 基于 AURA SSO 设计的 Three.js 参数化背景动画（性能优化版）
 *
 * 优化项:
 * - 帧率限制 (60fps -> 30fps)
 * - 简化 Shader 计算
 * - 鼠标移动节流
 * - 移动端自动禁用
 * - 页面不可见时暂停
 */

(function() {
    'use strict';

    // 容器
    const container = document.getElementById('webgl-container');
    if (!container) return;

    // 移动端检测 - 移动端禁用动画
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    // 性能检测 - 低性能设备禁用
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    if (isLowEnd) return;

    // 场景
    const scene = new THREE.Scene();

    // 正交相机
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // 渲染器 - 优化配置
    const renderer = new THREE.WebGLRenderer({
        antialias: false,  // 关闭抗锯齿提升性能
        alpha: true,
        powerPreference: 'low-power',  // 低功耗模式
        preserveDrawingBuffer: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 降低像素比提升性能
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 几何体
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Vertex Shader (保持不变)
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    // Fragment Shader - 简化版本
    const fragmentShader = `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform vec3 u_colorCore;
        uniform vec3 u_colorFringe;
        uniform float u_isLightMode;
        varying vec2 vUv;

        // 简化的噪声函数 - 减少计算量
        float simpleNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = dot(i, vec2(127.1, 311.7));
            float b = dot(i + 1.0, vec2(127.1, 311.7));
            return mix(
                fract(sin(a) * 43758.5453),
                fract(sin(b) * 43758.5453),
                f.x
            );
        }

        // 简化的距离场 - 移除噪声扰动
        float sdArc(vec2 p, vec2 center, float radius, float width) {
            // 简单的正弦波扰动，替代复杂的噪声
            p.y += sin(p.x * 2.0 + u_time * 0.3) * 0.05;
            return abs(length(p - center) - radius) - width;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 st = uv;
            st.x *= u_resolution.x / u_resolution.y;

            // 鼠标偏移减弱
            vec2 mouseOffset = (u_mouse - 0.5) * 0.05;
            st += mouseOffset;

            vec2 center = vec2(0.2, 0.5);

            // 简化的距离场调用
            float d1 = sdArc(st, center, 0.8, 0.01);
            float d2 = sdArc(st, center, 0.82, 0.04);

            // 简化的发光计算
            float coreGlow = exp(-d1 * 30.0);
            float fringeGlow = exp(-d2 * 12.0);

            // 简化的背景渐变
            float wash = smoothstep(1.0, -0.2, st.x) * 0.2;

            vec3 finalColor = vec3(0.0);
            finalColor += u_colorCore * coreGlow;
            finalColor += u_colorFringe * fringeGlow;
            finalColor += u_colorFringe * wash;

            float alpha = clamp(coreGlow + fringeGlow + wash, 0.0, 1.0);

            // 简化的色调映射
            finalColor = finalColor / (1.0 + finalColor);

            if (u_isLightMode > 0.5) {
                alpha = clamp((coreGlow * 1.2 + fringeGlow + wash * 0.4), 0.0, 0.5);
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

    // 鼠标跟踪 - 节流优化
    let targetMouse = new THREE.Vector2(0.5, 0.5);
    let mouseThrottle = false;

    document.addEventListener('mousemove', (e) => {
        if (mouseThrottle) return;
        mouseThrottle = true;
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
        setTimeout(() => { mouseThrottle = false; }, 50);  // 50ms 节流
    }, { passive: true });

    // 时钟
    const clock = new THREE.Clock();

    // 帧率控制 - 限制到 30fps
    let lastFrameTime = 0;
    const frameInterval = 1000 / 30;  // 30fps

    // 动画循环 - 带帧率限制
    function animate(currentTime) {
        if (currentTime - lastFrameTime < frameInterval) {
            requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = currentTime;

        const elapsedTime = clock.getElapsedTime();
        material.uniforms.u_time.value = elapsedTime;
        // 降低鼠标插值速度，减少计算
        material.uniforms.u_mouse.value.lerp(targetMouse, 0.03);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // 窗口大小调整 - 节流
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            material.uniforms.u_resolution.value.set(width, height);
        }, 150);  // 150ms 防抖
    }, { passive: true });

    // 主题切换监听
    window.updateAuraTheme = function() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const colors = getComputedColors();
        material.uniforms.u_colorCore.value = colors.core;
        material.uniforms.u_colorFringe.value = colors.fringe;
        material.uniforms.u_isLightMode.value = isLight ? 1.0 : 0.0;
    };

    // 页面可见性优化 - 不可见时暂停
    let isAnimationPaused = false;

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isAnimationPaused = true;
            // 停止渲染循环
            if (renderer.setAnimationLoop) {
                renderer.setAnimationLoop(null);
            }
        } else if (isAnimationPaused) {
            isAnimationPaused = false;
            // 恢复动画
            requestAnimationFrame(animate);
        }
    });

})();
