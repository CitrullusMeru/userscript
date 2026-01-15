// ==UserScript==
// @name        ICE MAGE SAFARI (iOS Stable + waitFor)
// @namespace   https://hentaiverse.org/
// @match       *://hentaiverse.org/*
// @version     1.2
// @description 2026.01.15 iOS Stable, no audio, DOM wait
// ==/UserScript==

(function () {
    'use strict';

    /* ================= Utils ================= */

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function waitFor(selector, timeout = 15000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = document.querySelector(selector);
            if (el) return el;
            await sleep(50);
        }
        return null;
    }

    await sleep(200);

    /* ================= Init ================= */

    (async function init() {
        if (location.href.includes('/isekai/')) return;

        await waitFor('body');

        const monsterPane = await waitFor('#pane_monster');
        if (!monsterPane) {
            console.log('🧊 ICE MAGE: monster pane not found');
            return;
        }

        console.log('🧊 ICE MAGE: battle page ready (iOS)');

        startScript();
        //BattleLoop();
    })();

    /* ================= Core ================= */

    function startScript() {

        let scriptRunning = false;

        const BaseHP = 16766;
        const BaseMP = 3401;
        const BaseSP = 1369;

        const t3cast = 0;

        /* ================= Buttons ================= */

        function makeBtn(text, top, right, handler) {
            const b = document.createElement('button');
            b.textContent = text;
            b.style.position = 'fixed';
            b.style.top = top;
            b.style.right = right;
            b.style.zIndex = 9999;
            b.onclick = handler;
            document.body.appendChild(b);
            return b;
        }

        makeBtn('MAGE START', '10px', '20px', async () => {
            if (scriptRunning) return;
            scriptRunning = true;
            console.log('▶️ Script started');
            await BattleLoop();
        });

        makeBtn('MAGE STOP', '40px', '20px', () => {
            scriptRunning = false;
            console.log('⛔ Script stopped');
        });

        makeBtn('MAGE NEXT', '10px', '150px', () => {
            scriptRunning = false;
            const endBtn = document.getElementById('btcp');
            if (endBtn) endBtn.click();
            else location.reload();
        });

        /* ================= Restore ================= */

        async function RestoreAll() {
            if (!scriptRunning) return;

            let changed = true;
            let safety = 0;

            while (changed && scriptRunning && safety++ < 20) {
                changed = false;

                const hpb = parseInt(document.getElementById('dvrhb')?.textContent || 0);
                const hpd = parseInt(document.getElementById('dvrhd')?.textContent || 0);
                const hp = Math.max(hpb, hpd);

                const mp = parseInt(document.getElementById('dvrm')?.textContent || 0);
                const sp = parseInt(document.getElementById('dvrs')?.textContent || 0);

                const click = async id => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.click();
                        await sleep(40);
                        return true;
                    }
                    return false;
                };

                /* HP */
                if (hp < BaseHP * 0.2 && await click('313')) changed = true;
                else if (hp < BaseHP * 0.55 && (await click('311') || await click('313') || await click('ikey_4'))) changed = true;
                else if (hp < BaseHP * 0.3 && await click('ikey_7')) changed = true;

                /* MP */
                if (mp < BaseMP * 0.7 && await click('ikey_5')) changed = true;
                else if (mp < BaseMP * 0.17 && await click('ikey_8')) changed = true;

                /* SP */
                const spPot = document.querySelector('#pane_effects img[src*="spiritpot.png"]');
                if (sp < BaseSP * 0.75 && !spPot && await click('ikey_3')) changed = true;
                else if (sp < BaseSP * 0.65 && await click('ikey_6')) changed = true;
                else if (sp < BaseSP * 0.25 && await click('ikey_9')) changed = true;

                /* Buffs */
                if (!document.querySelector('#pane_effects img[src*="regen.png"]') && hp > BaseHP * 0.4 && await click('312')) changed = true;
                if (!document.querySelector('#pane_effects img[src*="arcanemeditation.png"]') && hp > BaseHP * 0.7 && await click('432')) changed = true;
            }
        }

        /* ================= Debuff ================= */

        async function useWeaken() {
            if (!scriptRunning) return;

            const monsters = [...document.querySelectorAll('#pane_monster .btm1')]
                .filter(m => !m.querySelector('.btm5 img[src*="nbardead.png"]'));

            if (monsters.length < 5) return;

            const weakened = monsters.filter(m => m.querySelector('img[src*="weaken.png"]')).length;
            if (weakened > (5 * Math.floor(monsters.length / 6))) return;

            const target = monsters.find(m => !m.querySelector('img[src*="weaken.png"]'));
            if (!target) return;

            const btn = document.getElementById('212');
            if (btn) {
                btn.click();
                await sleep(40);
                target.click();
                await sleep(40);
            }
        }

        /* ================= Attack ================= */

        async function useSkills() {
            if (!scriptRunning) return;

            const monsters = [...document.querySelectorAll('#pane_monster .btm1')]
                .filter(m => !m.querySelector('.btm5 img[src*="nbardead.png"]'));

            if (!monsters.length) return;

            const imperiled = monsters.filter(m => m.querySelector('img[src*="imperil.png"]')).length;

            if (imperiled < Math.ceil(monsters.length / 2)) {
                const target = monsters.find(m => !m.querySelector('img[src*="imperil.png"]'));
                if (target) {
                    const btn = document.getElementById('213');
                    if (btn) {
                        btn.click();
                        await sleep(40);
                        target.click();
                        await sleep(40);
                    }
                }
                return;
            }

            const target = monsters.find(m => m.querySelector('img[src*="imperil.png"]'));
            if (!target) return;

            const skills = monsters.length <= 3 ? ['122', '121'] : ['123', '122', '121'];
            for (const id of skills) {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.click();
                    await sleep(40);
                    target.click();
                    await sleep(40);
                    break;
                }
            }
        }

        /* ================= Loop ================= */

        async function BattleLoop() {
            while (scriptRunning) {
                if (document.getElementById('btcp')) {
                    console.log('🏁 Battle ended');
                    scriptRunning = false;
                    break;
                }

                await RestoreAll();
                await useWeaken();
                await sleep(40);
                await useSkills();
                await sleep(40);
            }
        }
    }
    //init();
    scriptRunning = true;
    BattleLoop();
})();
