// 导航滚动状态
const nav = document.getElementById('nav');
addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 10);
}, { passive: true });

// 移动端菜单
const burger = document.getElementById('burger');
burger.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

// 导航下拉（服务）：点击切换，供触屏与键盘使用；hover 由 CSS 负责
document.querySelectorAll('.nav-drop').forEach(drop => {
  const btn = drop.querySelector('.nav-drop-btn');
  if (!btn) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = drop.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});
const closeDrops = () => {
  document.querySelectorAll('.nav-drop.open').forEach(d => {
    d.classList.remove('open');
    d.querySelector('.nav-drop-btn')?.setAttribute('aria-expanded', 'false');
  });
};
document.addEventListener('click', closeDrops);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrops();
});

// 滚动显现动画
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 案例数据计数动画
const animateNum = el => {
  const raw = el.dataset.raw;
  const target = parseFloat(raw);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1200, t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * ease) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
document.querySelectorAll('.case-result b').forEach(b => {
  const text = b.textContent.trim();
  const m = text.match(/^([+-]?)(\d+)(%?)$/);
  if (!m) return;
  b.dataset.prefix = m[1]; b.dataset.raw = m[2]; b.dataset.suffix = m[3];
  const obs = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { animateNum(b); obs.disconnect(); } });
  }, { threshold: 0.6 });
  obs.observe(b);
});

// 请求演示模态框（iframe 内嵌表单，不离开官网）
const demoModal = document.getElementById('demoModal');
const demoFrame = document.getElementById('demoFrame');
document.querySelectorAll('.demo-open').forEach(btn => btn.addEventListener('click', e => {
  e.preventDefault();
  if (!demoFrame.src) demoFrame.src = demoFrame.dataset.src; // 首次打开才加载
  demoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}));
const closeDemo = () => {
  demoModal.classList.remove('open');
  document.body.style.overflow = '';
};
demoModal.addEventListener('click', e => { if (e.target === demoModal) closeDemo(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeDemo(); });

// 复制联系方式（支持中英双语提示）
const copyTip = document.getElementById('copyTip');
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 剪贴板 API 不可用时的降级方案
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    btn.textContent = QI18N.copied();
    copyTip.textContent = QI18N.tip(btn.dataset.tipKey);
    copyTip.classList.add('ok');
    setTimeout(() => { btn.textContent = QI18N.copyLabel(); }, 2000);
  });
});
