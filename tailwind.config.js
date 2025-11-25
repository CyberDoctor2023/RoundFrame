/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mac: {
                    bg: '#f5f5f7',
                    sidebar: '#ffffff',
                    border: '#e5e5e5',
                    accent: 'var(--mac-accent)',
                    text: '#1d1d1f',
                    subtext: '#86868b',
                }
            },
            borderColor: {
                DEFAULT: '#e5e5e5',
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 10s linear infinite',
                'spin-slower': 'spin 15s linear infinite',
                'reverse-spin': 'reverseSpin 15s linear infinite',
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'gradient-xy': 'gradient-xy 3s ease infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                'blob': 'blob 8s infinite alternate',
            },
            keyframes: {
                reverseSpin: {
                    '0%': { transform: 'rotate(360deg)' },
                    '100%': { transform: 'rotate(0deg)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'gradient-xy': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    }
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', transform: 'scale(1.05)' }
                },
                blob: {
                    "0%": { transform: "translate(0, 0) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0, 0) scale(1)" }
                }
            }
        },
    },
    plugins: [],
}
