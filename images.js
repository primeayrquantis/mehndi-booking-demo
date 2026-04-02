/* Generate realistic mehndi/henna-style SVG art as image fallbacks */
(function() {
    function svg(w, h, content) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="#1a0e2e"/><stop offset="100%" stop-color="#0d0d1a"/></linearGradient>
                <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c9a84c"/><stop offset="50%" stop-color="#f0d78c"/><stop offset="100%" stop-color="#b8860b"/></linearGradient>
            </defs>
            <rect width="${w}" height="${h}" fill="url(#bg)"/>
            ${content}
        </svg>`;
    }

    // Paisley shape builder
    function paisley(cx, cy, s, rot) {
        const r = s;
        return `<g transform="translate(${cx},${cy}) rotate(${rot}) scale(${s/40})">
            <path d="M0,-35 C15,-30 20,-15 18,0 C16,15 10,25 0,35 C-10,25 -16,15 -18,0 C-20,-15 -15,-30 0,-35Z" fill="none" stroke="url(#gd)" stroke-width="1.5"/>
            <path d="M0,-25 C10,-20 13,-10 12,0 C11,10 6,18 0,25 C-6,18 -11,10 -12,0 C-13,-10 -10,-20 0,-25Z" fill="url(#gd)" opacity="0.08"/>
            <circle cx="0" cy="-15" r="3" fill="url(#gd)" opacity="0.6"/>
            <circle cx="0" cy="0" r="2.5" fill="url(#gd)" opacity="0.5"/>
            <circle cx="0" cy="12" r="2" fill="url(#gd)" opacity="0.4"/>
            <path d="M0,-28 C8,-22 10,-12 0,-5" fill="none" stroke="url(#gd)" stroke-width="0.8"/>
            <path d="M0,-28 C-8,-22 -10,-12 0,-5" fill="none" stroke="url(#gd)" stroke-width="0.8"/>
        </g>`;
    }

    // Flower/petal builder
    function flower(cx, cy, petals, r, innerR) {
        let p = '';
        for (let i = 0; i < petals; i++) {
            const a = (i * 360 / petals) * Math.PI / 180;
            const a1 = ((i * 360 / petals) - 15) * Math.PI / 180;
            const a2 = ((i * 360 / petals) + 15) * Math.PI / 180;
            p += `<path d="M${cx},${cy} Q${cx + r * 1.2 * Math.cos(a1)},${cy + r * 1.2 * Math.sin(a1)} ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} Q${cx + r * 1.2 * Math.cos(a2)},${cy + r * 1.2 * Math.sin(a2)} ${cx},${cy}Z" fill="url(#gd)" opacity="0.1" stroke="url(#gd)" stroke-width="0.8"/>`;
        }
        p += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="url(#gd)" opacity="0.15" stroke="url(#gd)" stroke-width="1"/>`;
        p += `<circle cx="${cx}" cy="${cy}" r="${innerR * 0.5}" fill="url(#gd)" opacity="0.4"/>`;
        return p;
    }

    // Vine/trail
    function vine(x1, y1, x2, y2, curves) {
        let p = `<path d="M${x1},${y1}`;
        const dx = (x2 - x1) / curves;
        const dy = (y2 - y1) / curves;
        let leaves = '';
        for (let i = 0; i < curves; i++) {
            const cx = x1 + dx * (i + 0.5) + (i % 2 === 0 ? 20 : -20);
            const cy = y1 + dy * (i + 0.5);
            const ex = x1 + dx * (i + 1);
            const ey = y1 + dy * (i + 1);
            p += ` Q${cx},${cy} ${ex},${ey}`;
            // leaves
            const lx = (cx + ex) / 2;
            const ly = (cy + ey) / 2;
            const side = i % 2 === 0 ? 1 : -1;
            leaves += `<path d="M${lx},${ly} Q${lx + side * 12},${ly - 8} ${lx + side * 6},${ly - 16}" fill="none" stroke="url(#gd)" stroke-width="0.8"/>`;
            leaves += `<circle cx="${lx + side * 6}" cy="${ly - 16}" r="1.5" fill="url(#gd)" opacity="0.5"/>`;
        }
        p += `" fill="none" stroke="url(#gd)" stroke-width="1.5"/>`;
        return p + leaves;
    }

    const patterns = [
        // 1: Hand with mehndi design  
        (w, h) => svg(w, h, `
            <g opacity="0.9">
                <!-- Hand outline -->
                <path d="M${w*0.35},${h*0.95} L${w*0.35},${h*0.45} Q${w*0.35},${h*0.35} ${w*0.38},${h*0.28} L${w*0.32},${h*0.12} Q${w*0.31},${h*0.08} ${w*0.34},${h*0.08} Q${w*0.37},${h*0.08} ${w*0.38},${h*0.12} L${w*0.4},${h*0.25}
                    M${w*0.4},${h*0.25} L${w*0.42},${h*0.08} Q${w*0.42},${h*0.04} ${w*0.45},${h*0.04} Q${w*0.48},${h*0.04} ${w*0.48},${h*0.08} L${w*0.46},${h*0.26}
                    M${w*0.46},${h*0.26} L${w*0.5},${h*0.06} Q${w*0.5},${h*0.02} ${w*0.53},${h*0.02} Q${w*0.56},${h*0.02} ${w*0.56},${h*0.06} L${w*0.52},${h*0.28}
                    M${w*0.52},${h*0.28} L${w*0.56},${h*0.1} Q${w*0.56},${h*0.06} ${w*0.59},${h*0.06} Q${w*0.62},${h*0.06} ${w*0.62},${h*0.1} L${w*0.58},${h*0.32}
                    Q${w*0.65},${h*0.35} ${w*0.65},${h*0.45} L${w*0.65},${h*0.95}" fill="url(#gd)" opacity="0.06" stroke="url(#gd)" stroke-width="1.5"/>
                <!-- Patterns on palm -->
                <circle cx="${w*0.5}" cy="${h*0.5}" r="25" fill="none" stroke="url(#gd)" stroke-width="1" stroke-dasharray="3 2"/>
                <circle cx="${w*0.5}" cy="${h*0.5}" r="15" fill="none" stroke="url(#gd)" stroke-width="1"/>
                <circle cx="${w*0.5}" cy="${h*0.5}" r="5" fill="url(#gd)" opacity="0.5"/>
                ${flower(w*0.5, h*0.5, 8, 20, 8)}
                <!-- Finger patterns -->
                ${[0.35, 0.42, 0.5, 0.58].map((x, i) => `
                    <line x1="${w*x+w*0.02}" y1="${h*0.15+i*3}" x2="${w*x+w*0.02}" y2="${h*0.25}" stroke="url(#gd)" stroke-width="0.8" stroke-dasharray="2 2"/>
                    <circle cx="${w*x+w*0.02}" cy="${h*0.18+i*2}" r="2" fill="url(#gd)" opacity="0.4"/>
                `).join('')}
                <!-- Wrist bands -->
                ${[0.72, 0.76, 0.82, 0.88].map(y => `
                    <line x1="${w*0.37}" y1="${h*y}" x2="${w*0.63}" y2="${h*y}" stroke="url(#gd)" stroke-width="${y > 0.8 ? 1.5 : 0.8}" stroke-dasharray="${y > 0.8 ? '5 3' : '3 2'}"/>
                `).join('')}
                ${paisley(w*0.42, h*0.65, 18, -20)}
                ${paisley(w*0.58, h*0.65, 18, 20)}
            </g>
        `),

        // 2: Bridal full mandala
        (w, h) => svg(w, h, `
            <g transform="translate(${w/2},${h/2})" opacity="0.9">
                ${[20, 35, 52, 70, 90, 110].map((r, i) => `<circle r="${r}" fill="none" stroke="url(#gd)" stroke-width="${i === 2 || i === 4 ? 1.5 : 0.8}" stroke-dasharray="${i % 2 === 0 ? '4 2' : '2 3'}"/>`).join('')}
                ${Array.from({length: 16}, (_, i) => {
                    const a = i * 22.5 * Math.PI / 180;
                    return `<line x1="${25*Math.cos(a)}" y1="${25*Math.sin(a)}" x2="${110*Math.cos(a)}" y2="${110*Math.sin(a)}" stroke="url(#gd)" stroke-width="0.4" opacity="0.3"/>`;
                }).join('')}
                ${Array.from({length: 8}, (_, i) => {
                    const a = i * 45 * Math.PI / 180;
                    return `
                        <path d="M${40*Math.cos(a)},${40*Math.sin(a)} Q${58*Math.cos(a+0.25)},${58*Math.sin(a+0.25)} ${52*Math.cos(a)},${52*Math.sin(a)} Q${58*Math.cos(a-0.25)},${58*Math.sin(a-0.25)} ${40*Math.cos(a)},${40*Math.sin(a)}Z" fill="url(#gd)" opacity="0.1" stroke="url(#gd)" stroke-width="0.8"/>
                        <path d="M${72*Math.cos(a)},${72*Math.sin(a)} Q${88*Math.cos(a+0.2)},${88*Math.sin(a+0.2)} ${85*Math.cos(a)},${85*Math.sin(a)} Q${88*Math.cos(a-0.2)},${88*Math.sin(a-0.2)} ${72*Math.cos(a)},${72*Math.sin(a)}Z" fill="url(#gd)" opacity="0.08" stroke="url(#gd)" stroke-width="0.8"/>
                        <circle cx="${95*Math.cos(a)}" cy="${95*Math.sin(a)}" r="4" fill="url(#gd)" opacity="0.3"/>
                        <circle cx="${60*Math.cos(a+0.4)}" cy="${60*Math.sin(a+0.4)}" r="2" fill="url(#gd)" opacity="0.4"/>
                    `;
                }).join('')}
                <circle r="12" fill="url(#gd)" opacity="0.15" stroke="url(#gd)" stroke-width="1.5"/>
                <circle r="5" fill="url(#gd)" opacity="0.5"/>
            </g>
        `),

        // 3: Arabic flowing trail with paisleys
        (w, h) => svg(w, h, `
            <g opacity="0.9">
                ${vine(w*0.1, h*0.5, w*0.9, h*0.5, 6)}
                ${vine(w*0.15, h*0.3, w*0.85, h*0.3, 5)}
                ${vine(w*0.15, h*0.7, w*0.85, h*0.7, 5)}
                ${paisley(w*0.25, h*0.45, 22, -30)}
                ${paisley(w*0.5, h*0.38, 28, 15)}
                ${paisley(w*0.75, h*0.48, 22, 30)}
                ${flower(w*0.15, h*0.5, 6, 15, 5)}
                ${flower(w*0.4, h*0.58, 6, 12, 4)}
                ${flower(w*0.65, h*0.42, 6, 14, 5)}
                ${flower(w*0.88, h*0.5, 6, 13, 4)}
                ${[0.2,0.35,0.5,0.65,0.8].map(x => `<circle cx="${w*x}" cy="${h*0.5}" r="2" fill="url(#gd)" opacity="0.5"/>`).join('')}
            </g>
        `),

        // 4: Peacock with detailed feathers
        (w, h) => svg(w, h, `
            <g opacity="0.9">
                <!-- Peacock body -->
                <path d="M${w*0.5},${h*0.85} Q${w*0.48},${h*0.7} ${w*0.5},${h*0.55} Q${w*0.52},${h*0.48} ${w*0.5},${h*0.4}" fill="none" stroke="url(#gd)" stroke-width="2.5"/>
                <circle cx="${w*0.5}" cy="${h*0.37}" r="12" fill="url(#gd)" opacity="0.15" stroke="url(#gd)" stroke-width="1.5"/>
                <circle cx="${w*0.5}" cy="${h*0.37}" r="5" fill="url(#gd)" opacity="0.4"/>
                <!-- Crown -->
                ${[0, -15, 15].map(deg => `<line x1="${w*0.5}" y1="${h*0.37}" x2="${w*0.5 + 8*Math.sin(deg*Math.PI/180)}" y2="${h*0.37 - 18}" stroke="url(#gd)" stroke-width="0.8" transform="rotate(${deg},${w*0.5},${h*0.37})"/><circle cx="${w*0.5 + 8*Math.sin(deg*Math.PI/180)}" cy="${h*0.37 - 20}" r="2" fill="url(#gd)" opacity="0.5" transform="rotate(${deg},${w*0.5},${h*0.37})"/>`).join('')}
                <!-- Feather fan -->
                ${Array.from({length: 9}, (_, i) => {
                    const angle = -80 + i * 20;
                    const a = angle * Math.PI / 180;
                    const len = 100 + Math.abs(4-i) * -8;
                    const ex = w*0.5 + len * Math.sin(a);
                    const ey = h*0.5 - len * Math.cos(a) * 0.6;
                    const mx = w*0.5 + len*0.6 * Math.sin(a);
                    const my = h*0.5 - len*0.6 * Math.cos(a) * 0.6;
                    return `
                        <path d="M${w*0.5},${h*0.5} Q${mx + 15*Math.cos(a)},${my} ${ex},${ey}" fill="none" stroke="url(#gd)" stroke-width="1"/>
                        <ellipse cx="${ex}" cy="${ey}" rx="12" ry="18" fill="url(#gd)" opacity="0.06" stroke="url(#gd)" stroke-width="0.8" transform="rotate(${angle},${ex},${ey})"/>
                        <ellipse cx="${ex}" cy="${ey}" rx="6" ry="10" fill="url(#gd)" opacity="0.1" stroke="url(#gd)" stroke-width="0.6" transform="rotate(${angle},${ex},${ey})"/>
                        <circle cx="${ex}" cy="${ey}" r="3" fill="url(#gd)" opacity="0.4"/>
                    `;
                }).join('')}
            </g>
        `),

        // 5: Lotus and paisley composition
        (w, h) => svg(w, h, `
            <g opacity="0.9">
                ${flower(w*0.5, h*0.4, 10, 35, 12)}
                <circle cx="${w*0.5}" cy="${h*0.4}" r="45" fill="none" stroke="url(#gd)" stroke-width="0.8" stroke-dasharray="3 3"/>
                <circle cx="${w*0.5}" cy="${h*0.4}" r="55" fill="none" stroke="url(#gd)" stroke-width="0.6" stroke-dasharray="5 4"/>
                ${paisley(w*0.22, h*0.35, 20, -45)}
                ${paisley(w*0.78, h*0.35, 20, 45)}
                ${paisley(w*0.3, h*0.7, 16, -30)}
                ${paisley(w*0.7, h*0.7, 16, 30)}
                ${paisley(w*0.5, h*0.75, 22, 0)}
                ${vine(w*0.15, h*0.9, w*0.85, h*0.9, 4)}
                ${vine(w*0.15, h*0.1, w*0.85, h*0.1, 4)}
                ${flower(w*0.2, h*0.15, 5, 10, 3)}
                ${flower(w*0.8, h*0.15, 5, 10, 3)}
                ${flower(w*0.2, h*0.85, 5, 10, 3)}
                ${flower(w*0.8, h*0.85, 5, 10, 3)}
            </g>
        `),

        // 6: Finger mehndi close-up
        (w, h) => svg(w, h, `
            <g opacity="0.9">
                <!-- Two fingers with detailed patterns -->
                <rect x="${w*0.3}" y="${h*0.05}" width="${w*0.15}" height="${h*0.9}" rx="30" fill="url(#gd)" opacity="0.04" stroke="url(#gd)" stroke-width="1.2"/>
                <rect x="${w*0.55}" y="${h*0.05}" width="${w*0.15}" height="${h*0.9}" rx="30" fill="url(#gd)" opacity="0.04" stroke="url(#gd)" stroke-width="1.2"/>
                <!-- Patterns on finger 1 -->
                ${[0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82].map((y, i) => `
                    <line x1="${w*0.32}" y1="${h*y}" x2="${w*0.43}" y2="${h*y}" stroke="url(#gd)" stroke-width="0.8"/>
                    ${i % 2 === 0 ? `<circle cx="${w*0.375}" cy="${h*(y+0.05)}" r="${4-i*0.3}" fill="url(#gd)" opacity="0.3"/>` :
                    `<path d="M${w*0.35},${h*(y+0.05)} L${w*0.375},${h*(y+0.02)} L${w*0.4},${h*(y+0.05)} L${w*0.375},${h*(y+0.08)}Z" fill="url(#gd)" opacity="0.2" stroke="url(#gd)" stroke-width="0.5"/>`}
                `).join('')}
                <!-- Patterns on finger 2 -->
                ${[0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].map((y, i) => `
                    <line x1="${w*0.57}" y1="${h*y}" x2="${w*0.68}" y2="${h*y}" stroke="url(#gd)" stroke-width="0.8"/>
                    ${i % 2 === 0 ?
                    `<path d="M${w*0.6},${h*(y+0.04)} Q${w*0.625},${h*(y+0.01)} ${w*0.65},${h*(y+0.04)} Q${w*0.625},${h*(y+0.07)} ${w*0.6},${h*(y+0.04)}Z" fill="url(#gd)" opacity="0.15" stroke="url(#gd)" stroke-width="0.6"/>` :
                    `<circle cx="${w*0.625}" cy="${h*(y+0.05)}" r="3" fill="none" stroke="url(#gd)" stroke-width="0.8"/><circle cx="${w*0.625}" cy="${h*(y+0.05)}" r="1.5" fill="url(#gd)" opacity="0.4"/>`}
                `).join('')}
                <!-- Tip decorations -->
                ${flower(w*0.375, h*0.08, 6, 8, 3)}
                ${flower(w*0.625, h*0.08, 6, 8, 3)}
            </g>
        `),

        // 7: Rose and swirl
        (w, h) => svg(w, h, `
            <g opacity="0.9">
                <!-- Central rose -->
                ${Array.from({length: 4}, (_, i) => `<circle cx="${w/2}" cy="${h*0.4}" r="${10+i*10}" fill="none" stroke="url(#gd)" stroke-width="1" opacity="${0.8-i*0.15}"/>`).join('')}
                ${Array.from({length: 3}, (_, i) => {
                    const r = 8 + i * 8;
                    return Array.from({length: 6}, (_, j) => {
                        const a = (j * 60 + i * 30) * Math.PI / 180;
                        return `<ellipse cx="${w/2 + r*Math.cos(a)}" cy="${h*0.4 + r*Math.sin(a)}" rx="6" ry="3" fill="url(#gd)" opacity="${0.15-i*0.03}" stroke="url(#gd)" stroke-width="0.5" transform="rotate(${j*60+i*30},${w/2 + r*Math.cos(a)},${h*0.4 + r*Math.sin(a)})"/>`;
                    }).join('');
                }).join('')}
                <circle cx="${w/2}" cy="${h*0.4}" r="4" fill="url(#gd)" opacity="0.5"/>
                <!-- Swirling vines from rose -->
                ${vine(w*0.5, h*0.55, w*0.15, h*0.85, 3)}
                ${vine(w*0.5, h*0.55, w*0.85, h*0.85, 3)}
                ${vine(w*0.5, h*0.25, w*0.2, h*0.1, 2)}
                ${vine(w*0.5, h*0.25, w*0.8, h*0.1, 2)}
                ${paisley(w*0.25, h*0.75, 16, -40)}
                ${paisley(w*0.75, h*0.75, 16, 40)}
                ${flower(w*0.2, h*0.9, 5, 10, 3)}
                ${flower(w*0.8, h*0.9, 5, 10, 3)}
            </g>
        `),

        // 8: Back of hand with full bridal design
        (w, h) => svg(w, h, `
            <g opacity="0.9">
                <!-- Hand shape -->
                <path d="M${w*0.25},${h*0.95} L${w*0.25},${h*0.35} Q${w*0.25},${h*0.25} ${w*0.35},${h*0.2} L${w*0.35},${h*0.05} Q${w*0.42},${h*0.03} ${w*0.42},${h*0.08} L${w*0.42},${h*0.2} L${w*0.48},${h*0.03} Q${w*0.52},${h*0.01} ${w*0.54},${h*0.05} L${w*0.52},${h*0.22} L${w*0.58},${h*0.05} Q${w*0.62},${h*0.03} ${w*0.64},${h*0.08} L${w*0.6},${h*0.25} L${w*0.64},${h*0.12} Q${w*0.68},${h*0.1} ${w*0.7},${h*0.15} L${w*0.66},${h*0.3} Q${w*0.75},${h*0.35} ${w*0.75},${h*0.45} L${w*0.75},${h*0.95}" fill="url(#gd)" opacity="0.04" stroke="url(#gd)" stroke-width="1"/>
                <!-- Central mandala on back of hand -->
                ${flower(w*0.5, h*0.45, 8, 25, 8)}
                <circle cx="${w*0.5}" cy="${h*0.45}" r="32" fill="none" stroke="url(#gd)" stroke-width="0.8" stroke-dasharray="3 2"/>
                <!-- Chain to middle finger -->
                <line x1="${w*0.5}" y1="${h*0.32}" x2="${w*0.5}" y2="${h*0.12}" stroke="url(#gd)" stroke-width="1" stroke-dasharray="4 3"/>
                ${[0.15, 0.2, 0.25, 0.3].map(y => `<circle cx="${w*0.5}" cy="${h*y}" r="2" fill="url(#gd)" opacity="0.4"/>`).join('')}
                <!-- Wrist patterns -->
                ${[0.7, 0.75, 0.8, 0.85, 0.9].map((y, i) => `
                    <line x1="${w*0.28}" y1="${h*y}" x2="${w*0.72}" y2="${h*y}" stroke="url(#gd)" stroke-width="${i===2?1.5:0.7}" stroke-dasharray="${i%2===0?'4 3':'2 2'}"/>
                `).join('')}
                <!-- Side paisleys -->
                ${paisley(w*0.32, h*0.55, 14, -25)}
                ${paisley(w*0.68, h*0.55, 14, 25)}
            </g>
        `)
    ];

    function makeSVGDataURI(fn, w, h) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fn(w, h));
    }

    document.querySelectorAll('img').forEach((img, idx) => {
        const fn = patterns[idx % patterns.length];
        img.onerror = function() {
            this.onerror = null;
            this.src = makeSVGDataURI(fn, 640, 480);
        };
        if (img.complete && img.naturalWidth === 0) {
            img.src = makeSVGDataURI(fn, 640, 480);
        }
    });
})();
