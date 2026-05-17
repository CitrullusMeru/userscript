// ==UserScript==
// @name         Countdown Timer for the Random Encounter Event on E-Hentai (DOM & HTTPS Fixed)
// @description  Adds a countdown timer for the Random Encounter event on E-Hentai.org and its subdomains. Fixes modern HTTPS and DOM selection issues.
// @grant        none
// @include      https://e-hentai.org/*
// @include      https://*.e-hentai.org/*
// @version      0.0.4
// @namespace    https://greasyfork.org/users/2233
// ==/UserScript==

var wnd = window
var doc = wnd.document
var loc = location
var href = loc.href

if(!doc.querySelector('*[name="ipb_login_submit"]') && /(\.e-hentai\.org\/)|(^e-hentai.org\/)/.test(loc.hostname+'/') && !/\/palette\.html?\b/.test(href) && !doc.getElementById('countdown_timer')) {
    
    // 改用現代標準的 encodeURIComponent / decodeURIComponent 處理 Cookie
    var set_cookie = function(k, v, t) {
        var expires = '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
        if(t) {
            var d = new Date()
            d.setTime(d.getTime() + (t * 24 * 60 * 60 * 1000))
            expires = '; expires=' + d.toGMTString()
        }
        doc.cookie = k + '=' + encodeURIComponent(v) + expires + '; domain=.' + /[^\.]+\.[^\.]+$/.exec(loc.hostname)[0] + '; path=/';
    }
    
    var set_session_cookie = function(k, v) {
        doc.cookie = k + '=' + encodeURIComponent(v) + '; domain=.' + /[^\.]+\.[^\.]+$/.exec(loc.hostname)[0] + '; path=/';
    }

    var get_cookie = function(k) {
        var n = k + '='
        var ca = doc.cookie.split(';')
        for(var i=0; i<ca.length; i++) {
            var c = ca[i]
            while (c.charAt(0) == ' ') { c = c.substring(1) }
            if (c.indexOf(n) == 0) { return decodeURIComponent(c.substring(n.length, c.length)) }
        }
        return undefined
    }

    if(!get_cookie('event')) { console.log('The "event" cookie does not exist or is invalid.'); throw 'exit' }
    if(!get_cookie('re_cnt')) { set_cookie('re_cnt', 0) }
    if(!get_cookie('re_lst')) { set_cookie('re_lst', '[]') }

    var timer_box = doc.createElement('DIV')
    timer_box.id = 'countdown_timer'
    timer_box.onclick = function() { if(/\bReady\b/i.test(this.textContent)) { wnd.open('https://e-hentai.org/news.php', href=='https://e-hentai.org/news.php'?'_self':'_blank') } }

    var toggle_re_lst = function() {
        var re_lst_box = doc.getElementById('re_lst_box')
        if(re_lst_box) { re_lst_box.parentNode.removeChild(re_lst_box); return }
        re_lst_box = doc.createElement('DIV')
        re_lst_box.id = 're_lst_box'
        re_lst_box.style.cssText = 'top:15px; right:0px; position:fixed; z-index:2147483647; background:rgba(0,255,0,1); color:#ff0000;'
        setTimeout(function() { re_lst_box.style.cssText = 'top:15px; right:0px; position:fixed; z-index:2147483647; background:rgba(0,255,0,0.2); color:#ff0000;' }, 3000)
        re_lst_box.innerHTML = '[List of RE Events Occurred Today]<BR>'
        re_lst_box.onmouseover = function () { this.style.cssText = 'top:15px; right:0px; position:fixed; z-index:2147483647; background:rgba(0,255,0,1); color:#ff0000;' }
        re_lst_box.onmouseout = function () { this.style.cssText = 'top:15px; right:0px; position:fixed; z-index:2147483647; background:rgba(0,255,0,0.2); color:#ff0000;' }
        var decode_hv_b64 = function(e) {
            var a = doc.createElement('A')
            a.href = 'https://hentaiverse.org/?s=Battle&ss=ba&encounter=' + e
            a.target = '_blank'
            a.text = (i+1) + '. '
            a.style.cssText = 'color:#ff0000'
            try {
                var d = atob(e)
                var m = /([^-]+?)-([^-]+?)-([^-]+)/.exec(d)
                if(m == null) { return a }
                var epoch = m[2]
                var da = new Date()
                da.setTime(parseInt(epoch)*1000)
                da = da.toLocaleTimeString()
                a.text = a.text + da
            } catch(err) {}
            return a
        }
        try {
            var re_lst = JSON.parse(get_cookie('re_lst'))
            if(re_lst) {
                for(var i=0, len=re_lst.length; i<len; i++) {
                    var a = decode_hv_b64(re_lst[i])
                    if(i != 0) { re_lst_box.appendChild(doc.createElement('BR')) }
                    re_lst_box.appendChild(a)
                }
                doc.body.appendChild(re_lst_box)
            }
        } catch(err) {}
    }
    addEventListener('keydown', function(evt) { if((evt.target.tagName!='INPUT') && (evt.target.tagName!='TEXTAREA') && (evt.keyCode == 76)) { toggle_re_lst() } }, false)
    if(href == 'https://e-hentai.org/news.php') { toggle_re_lst() }

    var newshead = doc.getElementById('newshead')
    if(newshead && /\/e-hentai\./.test(href)) {
        timer_box.style.color = '#ff0000'
        newshead.appendChild(timer_box)
    } else {
        timer_box.style.cssText = 'line-height:15px; top:0px; right:0px; position:fixed; z-index:2147483647; background:rgba(0,255,0,0.2); color:#ff0000;'
        doc.body.appendChild(timer_box)
    }

    var update_timer = function() {
        if(href == 'https://e-hentai.org/news.php') {
            var da = new Date()
            if((da.getUTCHours()==0) && (da.getUTCMinutes()==0) && (da.getUTCSeconds()<=10)) {
                if(!/^Your IP.*banned/i.test(doc.body.textContent)) {
                    setTimeout(function() {loc.reload()}, 10000)
                    return;
                }
            }
        }
        var now = Math.floor(new Date().getTime()/1000)
        var diff = parseInt(get_cookie('event')) + 1800 - now
        if(isNaN(diff)) { setTimeout(function() {loc.reload()}, 60000); return }
        
        if(diff <= 0) {
            timer_box.textContent = 'Ready! re_cnt=' + get_cookie('re_cnt')
            
            if(href == 'https://e-hentai.org/news.php') {
                if(/^Your IP.*banned/i.test(doc.body.textContent)) { return; }
                if(/The site is currently in Read Only\/Failover Mode/i.test(doc.documentElement.innerHTML)) { 
                    setTimeout(function() {loc.reload()}, 60000); 
                    return; 
                }
                
                if(get_cookie('re_reloaded') !== '1') {
                    set_session_cookie('re_reloaded', '1');
                    loc.reload();
                }
            }
            return; 
        } else {
            if(get_cookie('re_reloaded') === '1') {
                set_session_cookie('re_reloaded', '0');
            }
            
            var mm = Math.floor(diff / 60) + ''
            mm = (mm.length >= 2 ? mm : '0' + mm)
            var ss = Math.floor(diff % 60) + ''
            ss = (ss.length >= 2 ? ss : '0' + ss)
            timer_box.textContent = mm + ':' + ss + ', re_cnt=' + get_cookie('re_cnt')
            
            // 安全防禦：重構脆弱的 DOM 節點檢查，避免找不到節點時音效播不出且腳本崩潰
            if( (mm == '00') || ((mm == '01') && (ss == '00')) ) {
                try {
                    var ep = doc.getElementById('eventpane');
                    var ep_a = ep ? ep.querySelector('a') : null;
                    if(ep_a && ep_a.textContent != 'HentaiVerse') {
                        if(!doc.getElementById('re_snd')) {
                            var audio = new Audio('https://www.freesound.org/data/previews/234/234524_4019029-lq.mp3')
                            audio.id = 're_snd'
                            audio.volume = 1
                            audio.loop = true
                            audio.play()
                            doc.body.appendChild(audio)
                        }
                    }
                    else {
                        if(doc.getElementById('re_snd')) {
                            doc.getElementById('re_snd').parentNode.removeChild(doc.getElementById('re_snd'))
                        }
                    }
                } catch(e) {}
            }
            setTimeout(update_timer, 1000) 
        }
    }
    update_timer()

    var eventpane = doc.getElementById('eventpane')
    if(eventpane != null) {
        // 【關鍵修正 1】：改用正則不分大小寫、不分 http/https 去抓取包含 hentaiverse.org 的連結或 onclick 元素
        var re_evt = null;
        var links = eventpane.getElementsByTagName('a');
        for(var i=0; i<links.length; i++) {
            var onclick_str = links[i].getAttribute('onclick') || '';
            if(/hentaiverse\.org/i.test(links[i].href) || /hentaiverse\.org/i.test(onclick_str)) {
                re_evt = links[i];
                break;
            }
        }

        if(re_evt) {
            var hv_lnk = ''
            if((/^https?:\/\//.test(re_evt.href)) && (!/#/.test(re_evt.href))) { hv_lnk = re_evt.href }
            else {
                var onclick_content = re_evt.getAttribute('onclick') || '';
                hv_lnk = /.*window\.open\(['"]?([^'"]+)['"]?/.exec(onclick_content.toString().split('\n').join(''))
                if(hv_lnk) { hv_lnk = hv_lnk[1] }
            }
            if(hv_lnk) {
                var hv_b64 = hv_lnk.replace(/.+?&encounter=([^&]*).*/, '$1')
                try {
                    var re_lst = JSON.parse(get_cookie('re_lst'))
                    if((!re_lst) || (re_lst.length == 0)) { re_lst = [] }
                    if(re_lst.indexOf(hv_b64) == -1) { re_lst.push(hv_b64) }
                    re_lst = JSON.stringify(re_lst, null, ' ')
                    set_cookie('re_lst', re_lst)
                } catch(err) {}
            }
            else {
                console.log('Error: There is a random encounter event but the HentaiVerse link cannot be found.')
                throw 'exit'
            }
            
            // 【關鍵修正 2】：確保 Encounter 區塊強制在頁面上顯示出來（避免被原網站樣式隱藏）
            eventpane.style.setProperty('display', 'block', 'important');
            re_evt.style.setProperty('display', 'inline-block', 'important');
            
            re_evt.addEventListener('click', function() {
                if(re_evt.text != 'HentaiVerse') {
                    var current_cnt = parseInt(get_cookie('re_cnt')) || 0;
                    set_cookie('re_cnt', current_cnt + 1)
                    re_evt.text = 'HentaiVerse'
                    if(doc.getElementById('re_lst_box')) { toggle_re_lst(); toggle_re_lst() }
                }
                eventpane.style.setProperty('display', 'block', 'important');
            }, false)
        }
        else if(/\bdawn\b/i.test(eventpane.textContent)) {
            set_cookie('re_cnt', 0)
            set_cookie('re_lst', '[]')
            if(doc.getElementById('re_lst_box')) { toggle_re_lst(); toggle_re_lst() }
        }
    }
}
