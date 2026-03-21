/**
 * AURA Theme Toggle
 * 主题切换功能 - 支持深色/浅色模式
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'aura-theme';
    const DEFAULT_THEME = 'dark';

    // 获取存储的主题
    function getStoredTheme() {
        return localStorage.getItem(STORAGE_KEY);
    }

    // 保存主题
    function saveTheme(theme) {
        localStorage.setItem(STORAGE_KEY, theme);
    }

    // 获取系统主题偏好
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    // 设置主题
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // 更新按钮文本
        const themeText = document.getElementById('themeText');
        const themeIcon = document.getElementById('themeIcon');

        if (themeText) {
            themeText.textContent = theme.toUpperCase();
        }

        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'ph ph-moon' : 'ph ph-sun';
        }

        // 更新 Three.js 背景（如果存在）
        if (window.updateAuraTheme) {
            setTimeout(() => {
                window.updateAuraTheme();
            }, 50);
        }
    }

    // 切换主题
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        saveTheme(newTheme);
    }

    // 初始化主题
    function initTheme() {
        const storedTheme = getStoredTheme();
        const theme = storedTheme || getSystemTheme() || DEFAULT_THEME;
        setTheme(theme);
    }

    // 绑定切换按钮事件
    function bindToggleButton() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
    }

    // 监听系统主题变化
    function watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

            // 现代浏览器
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', (e) => {
                    if (!getStoredTheme()) {
                        setTheme(e.matches ? 'light' : 'dark');
                    }
                });
            }
        }
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            bindToggleButton();
            watchSystemTheme();
        });
    } else {
        initTheme();
        bindToggleButton();
        watchSystemTheme();
    }

    // 暴露全局方法
    window.AuraTheme = {
        set: setTheme,
        toggle: toggleTheme,
        get: getStoredTheme,
        init: initTheme
    };

})();
