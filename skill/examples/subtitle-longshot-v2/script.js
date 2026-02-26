const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function toast(msg) {
  const el = $("[data-toast]");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 1300);
}

function bindTabs() {
  $$('[data-tabs]').forEach((tabs) => {
    const btns = $$('button', tabs);
    btns.forEach((btn) => btn.addEventListener('click', () => {
      btns.forEach((i) => i.classList.remove('active'));
      btn.classList.add('active');
    }));
  });
}

function bindSheet() {
  $$('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open');
      const sheet = $(`[data-sheet="${id}"]`);
      if (sheet) {
        sheet.classList.add('show');
        sheet.setAttribute('aria-hidden', 'false');
      } else {
        toast('原型说明：功能说明入口');
      }
    });
  });

  $$('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      const sheet = $(`[data-sheet="${id}"]`);
      if (sheet) {
        sheet.classList.remove('show');
        sheet.setAttribute('aria-hidden', 'true');
      }
    });
  });
}

function bindCropBox() {
  const box = $('[data-crop-box]');
  const h = $('[data-crop-height]');
  const t = $('[data-crop-top]');
  if (!box || !h || !t) return;
  const sync = () => {
    box.style.height = `${h.value}%`;
    box.style.top = `${t.value}%`;
  };
  h.addEventListener('input', sync);
  t.addEventListener('input', sync);
  sync();

  $$('[data-apply-crop]').forEach((btn) => btn.addEventListener('click', () => {
    $$('[data-sheet]').forEach((s) => s.classList.remove('show'));
    toast('已应用字幕区域');
  }));
}

function bindProcess() {
  const start = $('[data-start]');
  if (!start) return;
  const bar = $('[data-progress]');
  const num = $('[data-progress-num]');
  const txt = $('[data-progress-text]');
  const stageChip = $('[data-stage-chip]');
  const result = $('[data-result]');
  const steps = {
    1: $('[data-step="1"] em'),
    2: $('[data-step="2"] em'),
    3: $('[data-step="3"] em'),
    4: $('[data-step="4"] em')
  };
  let timer;

  function setResult(enabled) {
    if (!result) return;
    if (enabled) {
      result.classList.remove('disabled', 'muted-btn');
      result.classList.add('primary');
      result.setAttribute('aria-disabled', 'false');
    } else {
      result.classList.add('disabled', 'muted-btn');
      result.classList.remove('primary');
      result.setAttribute('aria-disabled', 'true');
    }
  }

  if (result) {
    result.addEventListener('click', (e) => {
      if (result.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        toast('请先完成处理');
      }
    });
  }

  setResult(false);

  start.addEventListener('click', () => {
    if (start.dataset.running === '1') return;
    start.dataset.running = '1';
    start.textContent = '处理中...';
    stageChip.textContent = '处理中';

    let p = 0;
    const updateSteps = () => {
      if (p < 20) {
        steps[1].textContent = '进行中';
      } else if (p < 50) {
        steps[1].textContent = '完成';
        steps[2].textContent = '进行中';
        txt.textContent = '正在提取字幕画面...';
      } else if (p < 78) {
        steps[2].textContent = '完成';
        steps[3].textContent = '进行中';
        txt.textContent = '正在去重与整理...';
      } else {
        steps[3].textContent = '完成';
        steps[4].textContent = '进行中';
        txt.textContent = '正在拼接字幕长图...';
      }
    };

    timer = setInterval(() => {
      p += 6 + Math.random() * 7;
      if (p >= 100) p = 100;
      bar.style.width = `${p}%`;
      num.textContent = `${Math.round(p)}%`;
      updateSteps();

      if (p === 100) {
        clearInterval(timer);
        steps[4].textContent = '完成';
        start.dataset.running = '0';
        start.textContent = '重新处理';
        stageChip.textContent = '完成';
        txt.textContent = '处理完成，可进入预览页导出。';
        setResult(true);
        toast('处理完成');
      }
    }, 240);
  });

  const cancel = $('[data-cancel]');
  if (cancel) {
    cancel.addEventListener('click', () => {
      clearInterval(timer);
      start.dataset.running = '0';
      start.textContent = '开始处理';
      bar.style.width = '0%';
      num.textContent = '0%';
      txt.textContent = '已取消处理。';
      stageChip.textContent = '未开始';
      Object.values(steps).forEach((n) => (n.textContent = '待开始'));
      setResult(false);
      toast('已取消');
    });
  }
}

function bindPreviewDelete() {
  const list = $('[data-list]');
  if (!list) return;
  const count = $('[data-count]');
  const original = list.innerHTML;

  const refresh = () => {
    const n = $$('[data-item]', list).length;
    if (count) count.textContent = String(n);
  };

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const item = btn.closest('[data-item]');
    if (!item) return;
    item.remove();
    refresh();
    toast('已删除条目');
  });

  const reset = $('[data-reset]');
  if (reset) {
    reset.addEventListener('click', () => {
      list.innerHTML = original;
      refresh();
      toast('已还原条目');
    });
  }

  refresh();
}

function bindExportActions() {
  const save = $('[data-save]');
  const share = $('[data-share]');
  if (save) save.addEventListener('click', () => toast('已保存到相册（示意）'));
  if (share) share.addEventListener('click', () => toast('已打开系统分享（示意）'));
}

document.addEventListener('DOMContentLoaded', () => {
  bindTabs();
  bindSheet();
  bindCropBox();
  bindProcess();
  bindPreviewDelete();
  bindExportActions();
});
