/* A ten-chapter course built from a real interview sheet.
 * Content lives in course.js; this file only decides what to render and keeps
 * the tiny amount of state (current chapter, quiz answers) in localStorage. */
(() => {
  const $ = (s) => document.querySelector(s);
  const CH = window.COURSE || [];
  const KEY = 'pc.v1';
  const store = JSON.parse(localStorage.getItem(KEY) || '{"cur":0,"ans":{}}');

  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const save = () => localStorage.setItem(KEY, JSON.stringify(store));

  /* ---------- tiny widgets, one per chapter that needs one ---------- */
  const WIDGETS = {
    path: () => `
      <div class="wgt">
        <h3>interactive · the request path</h3>
        <p class="hint">Click a stage. This is the mental model every other chapter hangs from.</p>
        <div class="chain" id="chain"></div>
        <div class="chainsay" id="chainsay">Pick a stage above.</div>
      </div>`,
    ports: () => `
      <div class="wgt ports">
        <h3>reference · ports you will actually be asked</h3>
        <p class="hint">Type to filter — this is a lookup, not a memory test.</p>
        <input id="portq" placeholder="try 443, kube, postgres…" autocomplete="off">
        <div class="plist" id="plist"></div>
      </div>`,
    edge: () => `
      <div class="wgt">
        <h3>interactive · L4 versus L7</h3>
        <p class="hint">Same request, two balancers. Watch what each one can and cannot see.</p>
        <div class="toggle2" id="l46">
          <button data-m="4" class="on">layer 4</button>
          <button data-m="7">layer 7</button>
        </div>
        <div class="l46" id="l46say"></div>
      </div>`,
    k8sdebug: () => `
      <div class="wgt">
        <h3>interactive · read the event, name the cause</h3>
        <p class="hint">These are real kubectl describe lines. Pick what you would do first.</p>
        <div id="k8s"></div>
      </div>`,
  };

  const PORTS = [
    ['22','SSH — remote login to a Linux server'],
    ['53','DNS — name resolution'],
    ['80','HTTP'],
    ['443','HTTPS (TLS)'],
    ['3306','MySQL / MariaDB'],
    ['5432','PostgreSQL'],
    ['6379','Redis'],
    ['8080','Alternate HTTP / app servers'],
    ['9092','Kafka broker'],
    ['6443','Kubernetes API server'],
    ['2379','etcd client'],
    ['2380','etcd peer'],
    ['10250','kubelet API on each node'],
    ['30000-32767','Kubernetes NodePort range'],
    ['49152-65535','Ephemeral ports used for outbound connections'],
  ];

  const STAGES = [
    ['DNS', 'Turns app.example.com into 203.0.113.10.', 'server not found / NXDOMAIN', 'dig app.example.com'],
    ['TCP connect', 'Opens a connection to port 443.', 'connection refused (fast) or timeout (slow)', 'nc -zv app.example.com 443'],
    ['TLS', 'Certificates and handshake.', 'certificate expired / hostname mismatch', 'openssl s_client -connect app.example.com:443'],
    ['Load balancer', 'Chooses a backend. L4 by packet, L7 by URL.', '503 no healthy targets', 'check target health in the LB'],
    ['Reverse proxy / ingress', 'Routes by host and path, adds headers.', '502 bad gateway, 504 timeout, 404 from the proxy', 'kubectl describe ingress / nginx error log'],
    ['Application', 'Your code: validate, authorise, query.', '500, 401, 403, slow response', 'app logs, curl -v to the pod IP'],
    ['Database', 'Reads and writes the data.', 'slow queries, locks, connection refused', 'db logs, pg_stat_activity, df -h'],
  ];

  const K8S = [
    { ev: 'Warning  FailedScheduling  0/3 nodes are available: 3 Insufficient memory.',
      opts: ['Lower the memory request, or add a bigger node', 'Rebuild the image', 'Change the Service type', 'Restart the kubelet'],
      a: 0, why: 'Pending is a scheduling failure. The scheduler cannot find a node with enough allocatable memory for the request.' },
    { ev: 'Last State: Terminated  Reason: OOMKilled  Exit Code: 137',
      opts: ['Raise the memory limit or fix the leak, then check logs --previous', 'Add a ConfigMap', 'Increase the replica count', 'Check DNS'],
      a: 0, why: '137 = 128 + 9 (SIGKILL), which is how the kernel ends a container that exceeded its memory limit.' },
    { ev: 'Warning  FailedMount  MountVolume.SetUp failed for volume "config": configmap "app-config" not found',
      opts: ['Create the missing ConfigMap', 'Restart the node', 'Change the ingress rule', 'Scale the deployment'],
      a: 0, why: 'The pod cannot start without its volume. Missing ConfigMap/Secret is one of the most common crash reasons.' },
    { ev: 'Readiness probe failed: HTTP probe failed with statuscode: 503',
      opts: ['Check the app dependency the probe touches', 'Increase replicas', 'Change the Service port', 'Rebuild the image'],
      a: 0, why: 'The process is up but not Ready, so no traffic is sent. The probe is telling you a dependency is unhealthy.' },
  ];

  /* ---------- render ---------- */
  const el = (t, cls, html) => { const n = document.createElement(t); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  function answeredCount() {
    const all = CH.reduce((s, c) => s + c.quiz.length, 0);
    const right = Object.values(store.ans).filter((a) => a.ok).length;
    return { all, right };
  }

  function renderToc() {
    const { all, right } = answeredCount();
    $('#progressText').textContent = `${right} / ${all} answered`;
    $('#statQuiz').textContent = right;
    $('#statLeft').textContent = Math.max(0, all - right);
    $('#statDone').textContent = CH.filter((c, i) => c.quiz.every((_, qi) => store.ans[`${i}:${qi}`])).length;

    $('#toc').innerHTML = CH.map((c, i) => {
      const done = c.quiz.every((_, qi) => store.ans[`${i}:${qi}`]);
      return `<button class="${i === store.cur ? 'on' : ''}" data-i="${i}">
        <span class="n">${c.num}</span><span>${esc(c.title)}</span>${done ? '<span class="done">✓</span>' : ''}</button>`;
    }).join('');
    $('#toc').querySelectorAll('button').forEach((b) => b.onclick = () => { store.cur = +b.dataset.i; save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function renderChapter() {
    const i = store.cur, c = CH[i];
    $('#chapter').innerHTML = `
      <div class="ch-head"><span class="ch-num">chapter ${c.num}</span>
        <span class="ch-num">${i + 1} of ${CH.length}</span></div>
      <h2>${esc(c.title)}</h2>
      <p class="hook">${esc(c.hook)}</p>
      <p class="sentence">${esc(c.sentence)}</p>
      <p class="analogy">${esc(c.analogy)}</p>
      <div id="widget"></div>
      ${c.sections.map(([h, p]) => `<div class="sec"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}
      <pre>${esc(c.code)}</pre>
      <div class="say"><b>in the room, say this</b>${esc(c.say)}</div>
      <div class="quiz"><h3>check yourself</h3>${c.quiz.map((q, qi) => `
        <div class="qz ${store.ans[`${i}:${qi}`] ? 'answered' : ''}" data-qi="${qi}">
          <p>${esc(q.q)}</p>
          <div class="opts">${q.o.map((o, oi) => `<button class="opt" data-oi="${oi}">${esc(o)}</button>`).join('')}</div>
          <p class="why">${esc(q.why)}</p>
        </div>`).join('')}</div>
      <div class="next">
        <button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>← previous</button>
        <button class="btn primary" id="next" ${i === CH.length - 1 ? 'disabled' : ''}>next chapter →</button>
      </div>`;

    // restore answered quizzes
    $('#chapter').querySelectorAll('.qz').forEach((qz) => {
      const qi = +qz.dataset.qi, rec = store.ans[`${i}:${qi}`];
      if (!rec) return;
      qz.querySelectorAll('.opt').forEach((b) => {
        if (+b.dataset.oi === rec.a) b.classList.add('right');
        if (+b.dataset.oi === rec.pick && !rec.ok) b.classList.add('wrong');
      });
    });
    // answering
    $('#chapter').querySelectorAll('.qz').forEach((qz) => {
      const qi = +qz.dataset.qi, q = c.quiz[qi];
      qz.querySelectorAll('.opt').forEach((b) => b.onclick = () => {
        const pick = +b.dataset.oi;
        store.ans[`${i}:${qi}`] = { pick, a: q.a, ok: pick === q.a };
        save();
        // update in place: a full re-render would wipe the widget the reader just used
        qz.classList.add('answered');
        qz.querySelectorAll('.opt').forEach((x) => {
          x.classList.remove('right', 'wrong');
          if (+x.dataset.oi === q.a) x.classList.add('right');
          if (x === b && pick !== q.a) x.classList.add('wrong');
        });
        renderToc();
      });
    });

    $('#prev').onclick = () => { store.cur = Math.max(0, i - 1); save(); render(); window.scrollTo({ top: 0 }); };
    $('#next').onclick = () => { store.cur = Math.min(CH.length - 1, i + 1); save(); render(); window.scrollTo({ top: 0 }); };

    if (WIDGETS[c.id]) { $('#widget').innerHTML = WIDGETS[c.id](); mount(c.id); }
  }

  function mount(id) {
    if (id === 'path') {
      const chain = $('#chain'), out = $('#chainsay');
      chain.innerHTML = STAGES.map(([n], k) => `<button data-k="${k}">${k + 1}. ${n}</button>`).join('');
      chain.querySelectorAll('button').forEach((b) => b.onclick = () => {
        chain.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        const [name, what, fails, check] = STAGES[+b.dataset.k];
        out.innerHTML = `<b>${name}</b> — ${what}<br>
          <span style="color:var(--red)">when it breaks:</span> ${fails}<br>
          <span style="color:var(--green)">check with:</span> <code>${check}</code>`;
      });
    }
    if (id === 'ports') {
      const list = $('#plist');
      const draw = (q = '') => {
        const t = q.toLowerCase();
        list.innerHTML = PORTS.filter(([p, d]) => (p + ' ' + d).toLowerCase().includes(t))
          .map(([p, d]) => `<div><span>${p}</span><span>${d}</span></div>`).join('') || '<div><span>—</span><span>nothing matches</span></div>';
      };
      $('#portq').oninput = (e) => draw(e.target.value);
      draw();
    }
    if (id === 'edge') {
      const say = $('#l46say');
      const texts = {
        4: '<b>Layer 4</b> sees IPs and ports. It forwards the packet without reading HTTP.<ul style="margin:8px 0 0 18px;padding:0"><li>Fast, protocol-agnostic (TCP/UDP)</li><li>Cannot route by URL or header</li><li>TLS is usually not terminated here</li><li>Sticky sessions are per connection</li></ul>',
        7: '<b>Layer 7</b> reads the HTTP request. It can route by host and path, terminate TLS, add X-Forwarded-For, retry and cache.<ul style="margin:8px 0 0 18px;padding:0"><li>Route <code>/api</code> to one service, <code>/</code> to another</li><li>Health-check a URL, not just a port</li><li>More CPU per request</li><li>This is what an ingress controller is</li></ul>',
      };
      say.innerHTML = texts[4];
      $('#l46').querySelectorAll('button').forEach((b) => b.onclick = () => {
        $('#l46').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        say.innerHTML = texts[b.dataset.m];
      });
    }
    if (id === 'k8sdebug') {
      const wrap = $('#k8s');
      wrap.innerHTML = K8S.map((k, ki) => `
        <div class="qz" data-ki="${ki}" style="border-top:1px solid var(--line);padding-top:10px">
          <pre style="margin:0 0 8px">${esc(k.ev)}</pre>
          <div class="opts">${k.opts.map((o, oi) => `<button class="opt" data-oi="${oi}">${esc(o)}</button>`).join('')}</div>
          <p class="why">${esc(k.why)}</p>
        </div>`).join('');
      wrap.querySelectorAll('.qz').forEach((qz) => {
        const k = K8S[+qz.dataset.ki];
        qz.querySelectorAll('.opt').forEach((b) => b.onclick = () => {
          qz.classList.add('answered');
          qz.querySelectorAll('.opt').forEach((x) => {
            x.classList.toggle('right', +x.dataset.oi === k.a);
            x.classList.toggle('wrong', x === b && +x.dataset.oi !== k.a);
          });
        });
      });
    }
  }

  function render() { renderToc(); renderChapter(); }

  render();
  document.documentElement.dataset.ready = '1';
})();
