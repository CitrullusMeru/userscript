// ==UserScript==
// @name        ICE MAGE SAFARI
// @namespace   https://hentaiverse.org/
// @match       *://hentaiverse.org/*
// @version     1.0
// @author      -
// @description 2026.01.15
// @grant       unsafeWindow
// ==/UserScript==

(function() {
    // Run only on Persistent pages
    if (window.location.href.includes('/isekai/')) { return; }
        'use strict';

        const monsterPane = document.querySelector("#pane_monster");
        // ✅ 僅在戰鬥頁面啟動
        if (!/s=Battle/.test(window.location.search) || (monsterPane == null)) {
            console.log("🧊 ICE MAGE: not a battle page, script skipped.");
            return;
        }

        console.log("🧊 ICE MAGE: battle page detected, initializing...");

        let scriptRunning = false;

        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        const BaseHP = 16766;
        const BaseMP = 3401;
        const BaseSP = 1369;

        // 0是女高，1是普通情況
        const t3cast = 0

        function playSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator(); // 創建音波振盪器
        oscillator.type = 'sine'; // 設置波形類型（正弦波）
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 設置頻率（440Hz 是 A4 音）

        oscillator.connect(audioContext.destination); // 將音頻輸出到揚聲器
        oscillator.start();  // 開始播放
        oscillator.stop(audioContext.currentTime + 1); // 播放 1 秒後停止
        }

        // --- START / STOP / NEXT Buttons ---
        const btnStart = document.createElement('button');
        btnStart.textContent = "MAGE START (U)";
        btnStart.style.position = "fixed";
        btnStart.style.top = "10px";
        btnStart.style.right = "20px";
        btnStart.style.zIndex = 9999;
        btnStart.onclick = async () => {
            if (!scriptRunning) {
                scriptRunning = true;
                console.log("▶️ Script started");
                await RestoreAll();
                await BattleLoop();
            }
        };
        document.body.appendChild(btnStart);

        const btnStop = document.createElement('button');
        btnStop.textContent = "MAGE STOP (O)";
        btnStop.style.position = "fixed";
        btnStop.style.top = "40px";
        btnStop.style.right = "20px";
        btnStop.style.zIndex = 9999;
        btnStop.onclick = () => { scriptRunning = false; console.log("🔴 Script stopped"); };
        document.body.appendChild(btnStop);

        const btnNext = document.createElement('button');
        btnNext.textContent = "MAGE NEXT (I)";
        btnNext.style.position = "fixed";
        btnNext.style.top = "10px";
        btnNext.style.right = "150px"; // NEXT 左邊
        btnNext.style.zIndex = 9999;
        btnNext.onclick = async () => {
            const endBtn = document.getElementById('btcp');
            if (endBtn && endBtn.onclick) {
                scriptRunning = false;
                console.log("⏭ NEXT clicked - battle end button triggered");
                endBtn.click();
            } else {
                scriptRunning = false;
                console.log("⏭ NEXT clicked - no battle end button found");
                window.location = window.location;
            }
        };
        document.body.appendChild(btnNext);

        // Keypress listener for START (B), STOP (M), and NEXT (N)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'u' && !scriptRunning) { // Trigger start when U is pressed
                btnStart.click();
            }
            if (e.key === 'i') { // Trigger NEXT when I is pressed
                btnNext.click();
                //window.location = window.location;
            }
            if (e.key === 'o') { // Trigger STOP when O is pressed
                btnStop.click();
            }
        });

    async function RestoreAll() {
        if (!scriptRunning) return;

        //console.log("💟 RestoreAll triggered");

        const p_btn = document.getElementById('ikey_p');
        if(p_btn) {await p_btn.click(); console.log(`💎 gem used`); await sleep(0);}

//         const effects = [
//             //{img: "healthpot.png", id: "ikey_1"},
//             //{img: "manapot.png", id: "ikey_2"},
//             //{img: "coldinfusion.png", id: "ikey_n1"}
//         ];

//         for (let eff of effects) {
//             const btn = document.getElementById(eff.id);
//             if (btn && btn.onclick) {
//                 if (!document.querySelector(`#pane_effects img[src*='${eff.img}']`)) {
//                     await btn.click();
//                     console.log(`✨ Applied effect via ${eff.id}`);
//                 }
//             }
//         }

        // --- HP ---
        let hpb = parseInt(document.getElementById('dvrhb')?.textContent || 0);
        let hpd = parseInt(document.getElementById('dvrhd')?.textContent || 0);
        let hp = hpb > hpd?hpb:hpd
        if (hp < BaseHP * 0.2) {
            const hpBtns3 = ['313'];
            const btn = document.getElementById(hpBtns3);
            if (btn && btn.onclick) { await btn.click(); console.log(`💚💚 HP restore ${hpBtns3}`); await sleep(0); return RestoreAll(); }
        }
        if (hp < BaseHP * 0.55) {
            const hpBtns = ['311','313','ikey_4'];
            for (let btnId of hpBtns) {
                const btn = document.getElementById(btnId);
                if (btn && btn.onclick) { await btn.click(); console.log(`💚💚 HP restore ${btnId}`); await sleep(0); return RestoreAll(); }
            }
          hpb = parseInt(document.getElementById('dvrhb')?.textContent || 0);
          hpd = parseInt(document.getElementById('dvrhd')?.textContent || 0);
          hp = hpb > hpd?hpb:hpd
            if (hp < BaseHP * 0.3) {
                const hpBtns2 = ['ikey_7'];
                const btn = document.getElementById(hpBtns2);
                if (btn && btn.onclick) { await btn.click(); console.log(`💚💚💚 HP restore ${hpBtns2}`); await sleep(0); return RestoreAll(); }
                else {scriptRunning = false; console.log("💀 DEAD Script stopped");}
            }
        }



        // --- MP ---
        let mp = parseInt(document.getElementById('dvrm')?.textContent || 0);
        if (mp < BaseMP * 0.7) {
            const mpBtns = ['ikey_5'];
            for (let btnId of mpBtns) {
                const btn = document.getElementById(btnId);
                if (btn && btn.onclick) { await btn.click(); console.log(`💙💙 MP restore ${btnId}`); await sleep(0); mp = parseInt(document.getElementById('dvrm')?.textContent || 0); return RestoreAll(); }
            }
            if (mp < BaseMP * 0.17) {
                const mpBtns2 = ['ikey_8'];
                for (let btnId of mpBtns2) {
                    const btn = document.getElementById(btnId);
                    if (btn && btn.onclick) { await btn.click(); console.log(`💙💙💙 MP restore ${btnId}`); await sleep(0); mp = parseInt(document.getElementById('dvrm')?.textContent || 0); return RestoreAll(); }
                }
            }
        }


        // --- SP ---
        let sp = parseInt(document.getElementById('dvrs')?.textContent || 0);
        if (sp < BaseSP * 0.75) {
            const sp_pot = document.querySelector('#pane_effects img[src*="spiritpot.png"]');
            const sp_draught = document.getElementById('ikey_3');
            if (!sp_pot) {
                if (sp_draught && sp_draught.onclick) { await sp_draught.click(); console.log(`🧡 SP Draught used`); await sleep(0);}
            }
        }
        if (sp < BaseSP * 0.65) {
            const spBtns = ['ikey_6'];
            for (let btnId of spBtns) {
                const btn = document.getElementById(btnId);
                if (btn && btn.onclick) { await btn.click(); console.log(`🧡🧡 SP restore ${btnId}`); await sleep(0); sp = parseInt(document.getElementById('dvrs')?.textContent || 0); return RestoreAll(); }
            }
            if (sp < BaseSP * 0.25) {
                const spBtns2 = ['ikey_9'];
                for (let btnId of spBtns2) {
                    const btn = document.getElementById(btnId);
                    if (btn && btn.onclick) { await btn.click(); console.log(`🧡🧡🧡 SP restore ${btnId}`); await sleep(0); sp = parseInt(document.getElementById('dvrs')?.textContent || 0); return RestoreAll(); }
                }
            }
        }

        // --- 常駐技能效果 ---
        const regenImg = document.querySelector('#pane_effects img[src*="regen.png"]');
        if (!regenImg) {
            const regenBtn = document.getElementById('312');
            if (regenBtn && regenBtn.onclick && hp > BaseHP * 0.4) { await regenBtn.click(); console.log("💓 Regen cast"); await sleep(0); return RestoreAll();}
        }
        const arcaneImg = document.querySelector('#pane_effects img[src*="arcanemeditation.png"]');
        if (!arcaneImg) {
            const arcaneBtn = document.getElementById('432');
            if (arcaneBtn && arcaneBtn.onclick && hp > BaseHP * 0.7) { await arcaneBtn.click(); console.log("🧙🏻‍♀️ Arcane Focus cast"); await sleep(0); return RestoreAll();}
        }
    }

    async function useSkills() {
        if (!scriptRunning) return;
        await RestoreAll();

        // 重新抓取最新的怪物狀態
        let monsters = Array.from(document.querySelectorAll('#pane_monster .btm1'))
            .filter(m => !m.querySelector('.btm5 img[src*="nbardead.png"]'));
        let monstersAfter = Array.from(document.querySelectorAll('#pane_monster .btm1'))
            .filter(m => !m.querySelector('.btm5 img[src*="nbardead.png"]'));
        let imperiledCount = monstersAfter.filter(m => m.querySelector('img[src*="imperil.png"]')).length;
        if (!monsters.length) return;
        // 判斷要不要Imperil
        if (monstersAfter.length <= 4 || imperiledCount <= Math.ceil(monstersAfter.length/2)) {

        // 1. 找連續三個沒有Imperil的
        let targetForImperil = null;
        for (let i=0;i<=monsters.length-3;i++) {
            if (monsters.slice(i,i+3).every(m => !m.querySelector('img[src*="imperil.png"]'))) {
                targetForImperil = monsters[i+1]; // 正中間
            }
        }

        // 2. 如果沒有找到三連，找任意沒Imperil的
        if (!targetForImperil) {
            targetForImperil = monsters.find(m => !m.querySelector('img[src*="imperil.png"]'));
        }

        // 3. 施放Imperil
        if (targetForImperil) {
            const imperilBtn = document.getElementById('213');
            if (imperilBtn && imperilBtn.onclick) {
                await imperilBtn.click();
                //await sleep(10);
                await targetForImperil.click();
                console.log(`⚡ Imperil used on ${targetForImperil.id}`);
                //await sleep(30);
                return;
            }
        }
        }
        await RestoreAll();
        // 4. 檢查至少50%怪物已被施加Imperil
        monstersAfter = Array.from(document.querySelectorAll('#pane_monster .btm1'))
            .filter(m => !m.querySelector('.btm5 img[src*="nbardead.png"]'));
        imperiledCount = monstersAfter.filter(m => m.querySelector('img[src*="imperil.png"]')).length;
        if (imperiledCount >= Math.ceil(monstersAfter.length/2)) {
            // 5. 施放攻擊技能
            const target = monstersAfter.find(m => m.querySelector('img[src*="imperil.png"]'));
            if (t3cast) {
                if (target && monstersAfter.length > 3) {
                //if (target) {
                    const skillOrder = ['123','122','121'];
                    for (let skillId of skillOrder) {
                        const skillBtn = document.getElementById(skillId);
                        if (skillBtn && skillBtn.onclick) {
                            await skillBtn.click();
                            //await sleep(10);
                            await target.click();
                            console.log(`⚔ Skill ${skillId} used on ${target.id}`);
                            //await sleep(30);
                            await RestoreAll();
                            break;
                        }
                    }
                }
            }
            if (!t3cast) {
                //if (target && monstersAfter.length > 3) {
                if (target) {
                    const skillOrder = ['123','122','121'];
                    for (let skillId of skillOrder) {
                        const skillBtn = document.getElementById(skillId);
                        if (skillBtn && skillBtn.onclick) {
                            await skillBtn.click();
                            //await sleep(10);
                            await target.click();
                            console.log(`⚔ Skill ${skillId} used on ${target.id}`);
                            //await sleep(30);
                            await RestoreAll();
                            break;
                        }
                    }
                }
            }
            if (target && monstersAfter.length <= 3) {
                const skillOrder = ['122','121'];
                for (let skillId of skillOrder) {
                    const skillBtn = document.getElementById(skillId);
                    if (skillBtn && skillBtn.onclick) {
                        await skillBtn.click();
                        //await sleep(10);
                        await target.click();
                        console.log(`⚔ Skill ${skillId} used on ${target.id}`);
                        //await sleep(30);
                        await RestoreAll();
                        break;
                    }
                }
            }
        }
    }

        async function useWeaken() {
            if (!scriptRunning) return;
            await RestoreAll();

            // 重新抓取最新的怪物狀態
            let monsters = Array.from(document.querySelectorAll('#pane_monster .btm1'))
                .filter(m => !m.querySelector('.btm5 img[src*="nbardead.png"]'));
            let monstersAfter = Array.from(document.querySelectorAll('#pane_monster .btm1'))
                .filter(m => !m.querySelector('.btm5 img[src*="nbardead.png"]'));
            let weakenedCount = monstersAfter.filter(m => m.querySelector('img[src*="weaken.png"]')).length;
            if (!monsters.length) return;
            // 判斷要不要Weaken
            //if (weakenedCount <= monstersAfter.length) {
            if (monstersAfter.length >= 5 && weakenedCount <= (5 * Math.floor(monstersAfter.length/6))) {
            //if (monstersAfter.length >= 5 && weakenedCount <= monstersAfter.length) {

                // 1. 找連續三個沒有Weaken的
                let targetForWeaken = null;
                for (let i=0;i<=monsters.length-3;i++) {
                    if (monsters.slice(i,i+3).every(m => !m.querySelector('img[src*="weaken.png"]'))) {
                        targetForWeaken = monsters[i+1]; // 正中間
                    }
                }

                // 2. 如果沒有找到三連，找任意沒Weaken的
                if (!targetForWeaken) {
                    targetForWeaken = monsters.find(m => !m.querySelector('img[src*="weaken.png"]'));
                }

                // 3. 施放Weaken
                if (targetForWeaken) {
                    const weakenBtn = document.getElementById('212');
                    if (weakenBtn && weakenBtn.onclick) {
                        await weakenBtn.click();
                        await targetForWeaken.click();
                        console.log(`🥴 Weaken used on ${targetForWeaken.id}`);
                        await RestoreAll();
                        return;
                    }
                }
            }
        }


    // ID for skills/spells/items (in quotes), 0 for space, 1 for gem
    // set to [1] if you just want the gem icon or [] to disable
    // IDs:
    // 1001 Flee 1011 Scan 1101 FUS RO DAH 1111 Orbital Friendship Cannon
    // 2201 Shield Bash 2202 Vital Strike 2203 Merciful Blow
    // 2301 Great Cleave 2302 Rending Blow 2303 Shatter Strike
    // 2401 Iris Strike 2402 Backstab 2403 Frenzied Blows
    // 2101 Skyward Sword 2501 Concussive Strike
    // 111 Fiery Blast 112 Inferno 113 Flames of Loki
    // 121 Freeze  122 Blizzard 123 Fimbulvetr
    // 131 Shockblast 132 Chained Lightning 133 Wrath of Thor
    // 141 Gale 142 Downburst 143 Storms of Njord
    // 151 Smite 152 Banishment 153 Paradise Lost
    // 161 Corruption 162 Disintegrate 163 Ragnarok
    // 211 Drain 212 Weaken 213 Imperil
    // 221 Slow 222 Sleep 223 Confuse
    // 231 Blind 232 Silence 233 MagNet
    // 311 Cure 312 Regen 313 Full-Cure
    // 411 Protection 412 Haste 413 Shadow Veil
    // 421 Absorb 422 Spark of Life 423 Spirit Shield
    // 431 Heartseeker 432 Arcane Focus
    // ikey_1-ikey_15 items ikey_s1-ikey_s6 scrolls ikey_n1-ikey_n6 infusions


        async function depreciations3() {
            await useWeaken();
            await sleep(10);
            await useWeaken();
            await sleep(10);
            await useWeaken();
            await sleep(10);
            await useWeaken();
            await sleep(10);
        }

    async function BattleLoop() {
        while(scriptRunning) {
            const endPane = document.getElementById('btcp');
            if (endPane) {
                playSound();
                console.log("🏆 Battle Ended! Play sound.");
                scriptRunning = false;
                break;
            }
            await RestoreAll();
            await depreciations3();
            await sleep(10);
            await useSkills();
            await sleep(10);
            await depreciations3();
        }
      //window.location = window.location;
    }




})();
