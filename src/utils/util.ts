import confetti from 'canvas-confetti';

// 获取assets静态资源
export function getAssetsHomeFile(url: string) {
    const path = `../assets/icons/${url + ".png"}`;
    const modules = import.meta.globEager("../assets/icons/*");
    return modules[path].default;
}

export function showSuccessAnimation() {
    const end = Date.now() + (5 * 1000);
    const colors = [
        '#ffa62d',
        '#ff5e7e',
        '#26ccff',
        '#a25afd',
        '#88ff5a',
        '#fcff42',
        '#ff36ff',
    ];
    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
        })
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
        })

        if (Date.now() < end)
            requestAnimationFrame(frame)
    }())
}