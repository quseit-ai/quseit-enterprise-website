/* ============================================================
 * QUSEIT 企业站 · 数据分析埋点
 * ------------------------------------------------------------
 * 双通道设计:
 *   1. GA4 (Google Analytics 4)  — 海外流量、英文站、企业线索来源
 *   2. 百度统计 (Baidu Tongji)    — 中国大陆主力流量
 *
 *   原因:GA4 的采集域名 (googletagmanager.com / google-analytics.com)
 *   在中国大陆无法直连,纯 GA4 会漏掉绝大部分国内访问。
 *   两通道共用同一套事件定义,任一通道未填 ID 即自动跳过。
 *
 * 配置:只需修改下方 CONFIG 的两个 ID,其余代码无需改动。
 *
 * 用法:每个页面 <head> 内引入
 *   <script src="analytics.js" defer></script>
 *   (子目录用 ../analytics.js)
 * ============================================================ */
(function () {
  'use strict';

  /* ---------------- CONFIG ---------------- */
  var CONFIG = {
    // GA4 测量 ID,形如 G-XXXXXXXXXX。留空 = 不加载 GA4。
    ga4Id: 'G-DSCKK7S2JY',
    // 百度统计站点 ID,纯数字。留空 = 不加载百度统计。
    baiduId: 'eb891238e69a842831e65ce4d0d06445',
    // 本地调试:GA4 DebugView 可见。正式上线请保持 false。
    debug: false
  };

  var QA = window.QAnalytics = window.QAnalytics || {};

  /* 自引用路径 —— 用于拼接 privacy.html 等站内绝对链接 */
  var SELF_SRC = (document.currentScript && document.currentScript.getAttribute('src')) || 'analytics.js';
  var BASE = SELF_SRC.replace(/analytics\.js(\?.*)?$/, '');

  /* ---------------- 基础工具 ---------------- */
  function log() {
    if (CONFIG.debug && window.console) {
      console.log.apply(console, ['[QAnalytics]'].concat([].slice.call(arguments)));
    }
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { /* 隐私模式 / 禁用 cookie */ }
    return null;
  }

  function currentLang() {
    try { return (window.QI18N && window.QI18N.current && window.QI18N.current()) || 'zh'; }
    catch (e) { return 'zh'; }
  }

  function hostOf(url) {
    var m = /^https?:\/\/([^/?#]+)/i.exec(url || '');
    return m ? m[1].toLowerCase() : '';
  }

  function isExternal(url) {
    var h = hostOf(url);
    return !!h && h !== window.location.host.toLowerCase();
  }

  /* ---------------- UTM 捕获 ---------------- */
  /* 落地页上的 utm_* / gclid 会被记住并附加到后续所有事件上,
     便于在 GA4 里做来源归因(公众号 / 小红书 / 知乎投放)。 */
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  var UTM_STORE_KEY = 'qa_utm';
  var UTM_TTL = 30 * 24 * 3600 * 1000;

  function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var found = null;
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) { found = found || {}; found[k] = v; }
    });
    if (found) {
      store(UTM_STORE_KEY, JSON.stringify({ t: Date.now(), p: found }));
      return found;
    }
    var raw = store(UTM_STORE_KEY);
    if (!raw) return null;
    try {
      var obj = JSON.parse(raw);
      if (Date.now() - obj.t > UTM_TTL) { store(UTM_STORE_KEY, ''); return null; }
      return obj.p;
    } catch (e) { return null; }
  }

  var UTM = captureUtm();

  function withUtm(params) {
    if (!UTM) return params;
    var out = {};
    Object.keys(UTM).forEach(function (k) { out[k] = UTM[k]; });
    Object.keys(params || {}).forEach(function (k) { out[k] = params[k]; });
    return out;
  }

  /* ---------------- 内容分组 ---------------- */
  function contentGroup(path) {
    if (!path) return 'other';
    if (/^\/(index\.html)?$/.test(path)) return 'home';
    if (/\/about\.html$/.test(path)) return 'about';
    if (/\/partner\.html$/.test(path)) return 'partner';
    if (/\/fde\.html$/.test(path)) return 'fde_training';
    if (/\/1000-fdes\.html$/.test(path)) return 'campaign_u1000';
    if (/\/cases\/index\.html$/.test(path)) return 'cases';
    if (/\/cases\//.test(path)) return 'case_detail';
    if (/\/privacy\.html$/.test(path)) return 'legal';
    return 'other';
  }

  /* ---------------- GA4 ---------------- */
  var gaReady = false;

  function initGA() {
    if (gaReady || !CONFIG.ga4Id) return;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    /* Consent Mode v2 —— 默认拒绝,用户同意后再放开 */
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500
    });

    gtag('js', new Date());
    gtag('config', CONFIG.ga4Id, {
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: false,
      debug_mode: !!CONFIG.debug,
      transport_type: 'beacon'
    });

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4Id;
    document.head.appendChild(s);

    gaReady = true;
    log('GA4 loaded', CONFIG.ga4Id);
  }

  function gaConsent(granted) {
    if (!gaReady) return;
    window.gtag('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied'
    });
  }

  /* ---------------- 百度统计 ---------------- */
  var bdReady = false;

  function initBaidu() {
    if (bdReady || !CONFIG.baiduId) return;
    window._hmt = window._hmt || [];
    window._hmt.push(['setAutoTracking', true]);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://hm.baidu.com/hm.js?' + CONFIG.baiduId;
    document.head.appendChild(s);
    bdReady = true;
    log('Baidu loaded', CONFIG.baiduId);
  }

  /* ---------------- 统一事件出口 ---------------- */
  var EVENTS = [];

  function track(name, params) {
    params = withUtm(params || {});
    EVENTS.push({ name: name, params: params });
    log('event', name, params);

    if (gaReady) {
      window.gtag('event', name, params);
    }
    if (bdReady) {
      /* 百度统计的事件模型:类目 / 动作 / 标签 */
      var label = [];
      Object.keys(params).forEach(function (k) {
        if (k.indexOf('utm_') === 0 || k === 'gclid' || k === 'fbclid') return;
        label.push(k + '=' + params[k]);
      });
      window._hmt.push(['trackEvent', params.category || 'quseit', name, label.join('|') || '-']);
    }
  }

  QA.track = track;

  /* ---------------- 页面浏览 ---------------- */
  function pageView() {
    track('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      content_group: contentGroup(window.location.pathname),
      content_language: currentLang(),
      referrer: document.referrer || '(direct)'
    });
  }

  /* ---------------- 自动事件绑定 ---------------- */
  /* 全部基于现有 DOM 结构推断,无需改动页面标记;
     如需覆盖,在元素上加 data-track="event_name" 即可。 */
  var SKIP_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'beian.miit.gov.cn'];

  function onClick(e) {
    var el = e.target && e.target.closest ? e.target.closest('a,button') : null;
    if (!el) return;

    var explicit = el.getAttribute('data-track');
    var href = el.getAttribute('href') || '';
    var idAttr = el.getAttribute('data-i18n') || '';
    var label = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);

    /* 1. 显式声明优先 */
    if (explicit) {
      track(explicit, { cta_id: idAttr || null, cta_label: label, cta_path: el.className || null });
      return;
    }

    /* 2. 申请演示弹窗 —— 企业站最重要的转化动作 */
    if (el.classList.contains('demo-open')) {
      track('apply_start', { cta_id: idAttr || null, cta_label: label, category: 'conversion' });
      return;
    }

    /* 3. 复制联系方式 */
    if (el.classList.contains('copy-btn')) {
      track('contact_copy', { channel: el.getAttribute('data-tip-key') || null, cta_label: label });
      return;
    }

    /* 4. 价格档位 —— data-i18n="pr.btn" / "pr4.btn" 天然稳定,不受语言影响 */
    if (idAttr && /^pr\d?\.btn$/.test(idAttr)) {
      track('pricing_select', { tier: idAttr, cta_label: label, category: 'pricing' });
      return;
    }

    /* 5. 站外链接 */
    if (href && isExternal(href)) {
      var h = hostOf(href);
      if (SKIP_HOSTS.indexOf(h) !== -1) return;
      var dest = h;
      if (/agent\.quseit\.com$/.test(h)) dest = 'agent_space';
      else if (/enterprise\.quseit\.com$/.test(h)) dest = 'enterprise';
      else if (/feishu\.cn$/.test(h)) dest = 'apply_form';
      else if (/quseit\.com$/.test(h)) dest = 'quseit_site';
      track('outbound_click', {
        destination: dest,
        destination_host: h,
        cta_label: label,
        cta_id: idAttr || null
      });
      return;
    }

    /* 6. 站内主 CTA —— 用 data-i18n 当稳定标识 */
    if (href && idAttr && /^(nav|hero|d1|d2|pr|pr4|contact|cta)\./.test(idAttr)) {
      track('cta_click', {
        cta_id: idAttr,
        cta_label: label,
        cta_target: href,
        category: 'primary'
      });
    }
  }

  /* ---------------- 滚动深度 ---------------- */
  function initScrollDepth() {
    var marks = [25, 50, 75, 100];
    var hit = {};
    var ticking = false;

    function calc() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
      marks.forEach(function (m) {
        if (pct >= m && !hit[m]) {
          hit[m] = true;
          track('scroll_depth', { percent: m });
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(calc); }
    }, { passive: true });

    window.addEventListener('load', calc);
  }

  /* ---------------- 同意管理 (Consent Mode) ---------------- */
  var CONSENT_KEY = 'qa_consent';

  /* granted = 已同意, denied = 已拒绝, null = 从未选择 */
  function consentState() { return store(CONSENT_KEY); }
  function hasConsent() { return consentState() === 'granted'; }
  /* 用户做过选择(无论同意或拒绝)后就不再重复询问 */
  function hasDecided() { return consentState() === 'granted' || consentState() === 'denied'; }

  /* 横幅由 JS 自行注入,避免在每个页面里复制同一段标记。
     若某页已手写 #qaConsent,则复用它。 */
  function ensureBanner() {
    var el = qs('#qaConsent');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'qaConsent';
    el.className = 'qa-consent';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<p class="qa-consent-text"></p>' +
      '<div class="qa-consent-actions">' +
      '  <a class="qa-consent-link" href="' + BASE + 'privacy.html"></a>' +
      '  <button type="button" class="qa-consent-btn" data-qa-consent="reject"></button>' +
      '  <button type="button" class="qa-consent-btn is-solid" data-qa-consent="accept"></button>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function renderBanner() {
    if (hasDecided()) return;
    var el = ensureBanner();
    el.hidden = false;
    /* 跟随站点语言刷新文案 */
    var lang = currentLang();
    var zh = {
      text: '本站使用统计 Cookie 了解访问情况,数据均为匿名采集。',
      more: '隐私政策',
      accept: '接受',
      reject: '拒绝'
    };
    var en = {
      text: 'We use analytics cookies to understand how this site is used. Your data stays anonymous.',
      more: 'Privacy Policy',
      accept: 'Accept',
      reject: 'Reject'
    };
    var t = lang === 'en' ? en : zh;
    var txt = qs('.qa-consent-text', el);
    var lk = qs('.qa-consent-link', el);
    if (txt) txt.textContent = t.text;
    if (lk) { lk.textContent = t.more; lk.href = BASE + 'privacy.html'; }
    qsa('.qa-consent-btn', el).forEach(function (b) {
      b.textContent = b.getAttribute('data-qa-consent') === 'accept' ? t.accept : t.reject;
    });
  }

  function setConsent(v) {
    store(CONSENT_KEY, v);
    var el = qs('#qaConsent');
    if (el) el.hidden = true;
    if (v === 'granted') {
      gaConsent(true);
      initBaidu();
      track('consent_granted', { category: 'privacy' });
    } else {
      gaConsent(false);
      track('consent_rejected', { category: 'privacy' });
    }
  }

  function initConsent() {
    if (hasDecided()) {
      if (hasConsent()) {
        gaConsent(true);
        initBaidu();
      } else {
        gaConsent(false);
      }
      ensureBanner().hidden = true;
      return;
    }
    var el = ensureBanner();
    renderBanner();
    qsa('.qa-consent-btn', el).forEach(function (b) {
      b.addEventListener('click', function () {
        setConsent(b.getAttribute('data-qa-consent') === 'accept' ? 'granted' : 'denied');
      });
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    initGA();
    initConsent();

    if (hasConsent()) {
      initBaidu();
    }
    /* 未同意(或已拒绝)时只做无痕的页面浏览统计, 不写存储型 Cookie */
    pageView();

    document.addEventListener('click', onClick, { capture: true });

    /* 语言切换 —— i18n.js 会派发 quseit:lang */
    window.addEventListener('quseit:lang', function (e) {
      track('lang_switch', { content_language: (e && e.detail && e.detail.lang) || currentLang() });
    });

    initScrollDepth();

    /* 同意横幅文案随语言切换刷新 */
    window.addEventListener('quseit:lang', renderBanner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
