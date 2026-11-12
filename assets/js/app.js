const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=async n=>{try{const r=await fetch('/data/'+n+'.json',{cache:'no-cache'});return r.ok?await r.json():null}catch{return null}};
const brl=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const dt=s=>s?s.split('-').reverse().join('/'):'';
const store={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}}};
const R=document.documentElement;let z=+store.get('fs')||100;
const applyFs=()=>{R.style.fontSize=z+'%';store.set('fs',z)};applyFs();
if(store.get('th'))R.dataset.theme=store.get('th');
window.fs=d=>{z=Math.min(140,Math.max(85,z+d*10));applyFs()};
window.ct=()=>{const dk=matchMedia('(prefers-color-scheme:dark)').matches,cur=R.dataset.theme||(dk?'dark':'light');R.dataset.theme=cur=='dark'?'light':'dark';store.set('th',R.dataset.theme)};
const NAV=[['/','Início'],['/sobre/','Sobre'],['/transparencia/','Transparência'],['/projetos/','Projetos LIE'],['/cotacoes/','Cotações'],['/ouvidoria/','Ouvidoria']];
const doc=(t,a,x='')=>`<div class="row"><span>${esc(t)}${x}</span>${a?`<a class="btn s" href="/documentos/${encodeURI(a)}" target="_blank" rel="noopener">Abrir PDF</a>`:'<span class="tag">Em breve</span>'}</div>`;
const empty=m=>`<p class="empty">${m}</p>`;
const tg=s=>s=='Concluído'?'':s=='Em execução'?'ok':'wn';
const STATUS=['Em captação','Em execução','Concluído'];

(async()=>{
const [site,dir,docs,trans,proj,cot]=await Promise.all(['site','diretoria','documentos','transparencia','projetos','cotacoes'].map(load));
const S=site||{},PR=proj||[],CO=cot||{abertas:[],encerradas:[]},DC=docs||{};
const page=document.body.dataset.page,path=location.pathname;

$('#top').innerHTML=`<a class="skip" href="#app">Ir para o conteúdo</a>
<div class="top"><div class="w"><button onclick="fs(1)" aria-label="Aumentar fonte">A+</button><button onclick="fs(-1)" aria-label="Diminuir fonte">A−</button><button onclick="ct()">Alto contraste</button></div></div>
<header class="h"><div class="w"><a class="brand" href="/" aria-label="FVLP – Federação de Voo Livre do Paraná, início"><img src="/assets/img/logo-fvlp.jpg" alt="FVLP – Federação de Voo Livre do Paraná"></a>
<nav aria-label="Principal">${NAV.map(n=>`<a href="${n[0]}"${(n[0]=='/'?path=='/'||path=='/index.html':path.startsWith(n[0]))?' aria-current="page"':''}>${n[1]}</a>`).join('')}</nav></div></header>`;
$('#foot').innerHTML=`<footer><div class="w"><b>${esc(S.nome||'Federação de Voo Livre do Paraná')} · Gestão 2025/26</b><br>${[S.cnpj&&'CNPJ '+esc(S.cnpj),S.email&&`<a href="mailto:${esc(S.email)}">${esc(S.email)}</a>`,S.telefone&&esc(S.telefone),S.endereco&&esc(S.endereco)].filter(Boolean).join(' · ')}${S.cnpj||S.email||S.telefone||S.endereco?'<br>':''}<a href="/ouvidoria/">Ouvidoria</a> · <a href="/privacidade/">Privacidade</a></div></footer>
<div vw class="enabled"><div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>`;
const vl=document.createElement('script');vl.src='https://vlibras.gov.br/app/vlibras-plugin.js';vl.onload=()=>{try{new window.VLibras.Widget('https://vlibras.gov.br/app')}catch{}};document.body.append(vl);

const app=$('#app');
const pc=p=>{const pct=p.valorAprovado?Math.min(100,p.valorCaptado/p.valorAprovado*100):0;return `<a class="card tile" href="/projetos/?id=${encodeURIComponent(p.id)}"><span class="tag ${tg(p.status)}">${esc(p.status)}</span> <span class="tag">${esc(p.ano)}</span><h3 style="margin-top:.5rem">${esc(p.nome)}</h3><p>${brl(p.valorCaptado)} captados de ${brl(p.valorAprovado)}</p><div class="bar"><i style="width:${pct}%"></i></div></a>`};
const bindForm=(f,key)=>f.addEventListener('submit',async e=>{e.preventDefault();const s=$('.st',f),u=(S.formularios||{})[key];
 if(!u){s.textContent='Este formulário ainda não está ativo. Entre em contato pelo e-mail da federação.';return}
 const b=$('button[type=submit]',f);b.disabled=true;s.textContent='Enviando…';
 try{const fd=new FormData(f);fd.append('form',key);const r=await fetch(u,{method:'POST',body:new URLSearchParams(fd)});const j=await r.json();if(!j.ok)throw 0;
  f.reset();const an=$('#an',f);if(an)an.dispatchEvent(new Event('change'));s.textContent='Enviado. Obrigado.'+(j.protocolo?' Protocolo: '+j.protocolo+'. Guarde este número.':'')}
 catch{s.textContent='Não foi possível enviar. Tente novamente em instantes.'}
 b.disabled=false});

const P={
home(){const rec=PR.slice(0,3);
 app.innerHTML=`<section class="hero"><div class="w"><div><h1>Voo livre,<br>contas abertas.</h1><p>Projetos, balanços, cotações e documentos da federação que cuida do parapente e da asa-delta no Paraná.</p><p><a class="btn" href="/projetos/">Ver projetos incentivados</a> <a class="btn s" href="/transparencia/">Portal da Transparência</a></p></div>
<svg viewBox="0 0 400 260" role="img" aria-label="Trajeto de um voo, do verde ao azul"><defs><linearGradient id="gr" x1="0" x2="1"><stop offset="0" stop-color="#84C225"/><stop offset="1" stop-color="#4aa3e0"/></linearGradient></defs><path d="M20 220 L90 200 C120 120 150 90 190 110 C230 130 220 60 270 50 C310 42 330 70 380 30" fill="none" stroke="url(#gr)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="220" r="7" fill="#84C225"/><circle cx="380" cy="30" r="7" fill="#4aa3e0"/><text x="30" y="246" fill="#ccc" font-size="13">decolagem</text><text x="300" y="20" fill="#ccc" font-size="13">pouso</text></svg></div></section>
<div class="w" style="padding-top:2rem"><div class="grid">${[['/sobre/','Quem somos','Diretoria, conselhos e documentos'],['/transparencia/','Transparência','Balanços e certidões por ano'],['/projetos/','Projetos LIE','Valores, prazos e prestação de contas'],['/cotacoes/','Cotações','Compras abertas e propostas'],['/ouvidoria/','Denúncias','Canal com opção de anonimato']].map(t=>`<a class="card tile" href="${t[0]}"><h3>${t[1]}</h3><p>${t[2]}</p></a>`).join('')}</div>
${rec.length?`<h2>Projetos recentes</h2><div class="grid">${rec.map(pc).join('')}</div>`:''}</div>`},
sobre(){const m=dir?.membros||[],at=dir?.atletas||[];
 app.innerHTML=`<div class="w"><h1>Sobre a federação</h1>
<p>${esc(S.sobre||'Entidade que organiza, representa e desenvolve o parapente e a asa-delta no Paraná.')}</p>
<h2>Diretoria e conselhos</h2><div class="grid">${m.map((x,i)=>`<div class="card" style="border-top:5px solid var(${i%2?'--b':'--g'})"><small>${esc(x.cargo)}</small><h3>${esc(x.nome||'A definir')}</h3></div>`).join('')}</div>
<h2>Participação de atletas</h2>${at.length?`<div class="card">${at.map(a=>`<div class="row"><span>${esc(a.nome)}</span><small>${esc(a.funcao||'')}</small></div>`).join('')}</div>`:empty('Comissão de atletas a ser publicada (Art. 18-A).')}
<h2>Documentos institucionais</h2><div class="card">${(DC.institucionais||[]).map(d=>doc(d.titulo,d.arquivo)).join('')}</div></div>`},
transparencia(){const anos=trans?.anos||[];let ano=anos[0]?.ano;
 const draw=()=>{const a=anos.find(x=>x.ano==ano),cs=trans?.certidoes||[],rm=DC.remuneracao;
 app.innerHTML=`<div class="w"><h1>Portal da Transparência</h1><div class="f" role="group" aria-label="Exercício">${anos.map(x=>`<button aria-pressed="${x.ano==ano}" data-a="${x.ano}">${x.ano}</button>`).join('')}</div>
<div class="grid"><div class="card"><h3>Demonstrações contábeis ${esc(ano||'')}</h3>${a?a.demonstracoes.map(d=>doc(d.titulo,d.arquivo)).join(''):empty('Nenhum exercício publicado ainda.')}</div>
<div class="card"><h3>Certidões e regularidade</h3>${cs.map(c=>{const v=c.validade,vencida=v&&v<new Date().toISOString().slice(0,10);return doc(c.titulo,c.arquivo,v?` <span class="tag ${vencida?'bad':'ok'}">${vencida?'Vencida em':'Válida até'} ${dt(v)}</span>`:'')}).join('')}</div></div>
${rm?`<div class="card" style="margin-top:1rem"><h3>Remuneração de dirigentes</h3>${doc(rm.titulo,rm.arquivo)}</div>`:''}</div>`;
 $$('[data-a]').forEach(b=>b.onclick=()=>{ano=+b.dataset.a;draw()})};draw()},
projetos(){const id=new URLSearchParams(location.search).get('id');
 if(id){const p=PR.find(x=>String(x.id)==id);
  if(!p){app.innerHTML=`<div class="w"><p><a href="/projetos/">← Todos os projetos</a></p>${empty('Projeto não encontrado.')}</div>`;return}
  const pct=p.valorAprovado?Math.min(100,p.valorCaptado/p.valorAprovado*100):0,ds=(p.documentos&&p.documentos.length)?p.documentos:['Plano de trabalho aprovado','Termo de compromisso e publicação no DOU','Relatórios parciais e finais','Prestação de contas simplificada'].map(t=>({titulo:t,arquivo:''}));
  document.title=p.nome+' · FVLP';
  app.innerHTML=`<div class="w"><p><a href="/projetos/">← Todos os projetos</a></p><h1>${esc(p.nome)}</h1><span class="tag ${tg(p.status)}">${esc(p.status)}</span> <span class="tag">${esc(p.modalidade||'')}</span> ${p.processo?`<span class="tag">${esc(p.processo)}</span>`:''}
<div class="grid" style="margin-top:1rem"><div class="card"><h3>Objeto</h3><p>${esc(p.descricao||'Descrição a ser publicada.')}</p><p><b>Local:</b> ${esc(p.local||'—')}<br><b>Público:</b> ${esc(p.publico||'—')}<br><b>Vigência:</b> ${esc(p.vigencia||'—')}</p></div>
<div class="card"><h3>Dados financeiros</h3><div class="row"><span>Aprovado</span><b>${brl(p.valorAprovado)}</b></div><div class="row"><span>Captado</span><b>${brl(p.valorCaptado)}</b></div><div class="row"><span>Saldo a captar</span><b>${brl((p.valorAprovado||0)-(p.valorCaptado||0))}</b></div><div class="bar"><i style="width:${pct}%"></i></div></div></div>
<div class="card" style="margin-top:1rem"><h3>Documentos do projeto</h3>${ds.map(d=>doc(d.titulo,d.arquivo)).join('')}</div>
<div class="card" style="margin-top:1rem"><h3>Patrocinadores e doadores</h3>${(p.patrocinadores||[]).length?`<div class="lg">${p.patrocinadores.map(s=>`<img src="/assets/patrocinadores/${encodeURI(s.logo)}" alt="${esc(s.nome)}">`).join('')}</div>`:empty('Marcas dos patrocinadores a serem publicadas.')}</div></div>`;return}
 let st='Todos';const draw=()=>{const l=PR.filter(p=>st=='Todos'||p.status==st);
 app.innerHTML=`<div class="w"><h1>Projetos incentivados</h1><p>Projetos aprovados na Lei de Incentivo ao Esporte, com valores, prazos e documentos.</p>
<div class="f" role="group" aria-label="Filtrar por status">${['Todos',...STATUS].map(x=>`<button aria-pressed="${x==st}" data-s="${x}">${x}</button>`).join('')}</div>${l.length?`<div class="grid">${l.map(pc).join('')}</div>`:empty(PR.length?'Nenhum projeto com este status.':'Nenhum projeto publicado ainda.')}</div>`;
 $$('[data-s]').forEach(b=>b.onclick=()=>{st=b.dataset.s;draw()})};draw()},
cotacoes(){const ab=CO.abertas||[],en=CO.encerradas||[],rg=DC.regulamentoCompras;
 app.innerHTML=`<div class="w"><h1>Compras e cotações</h1>${rg?`<div class="card">${doc(rg.titulo,rg.arquivo)}</div>`:''}
<h2>Cotações abertas</h2><div class="card">${ab.length?ab.map(c=>doc(c.id+' · '+c.titulo,c.termo,` <span class="tag wn">Prazo ${esc(dt(c.prazo))}</span>`)).join(''):empty('Nenhuma cotação aberta no momento.')}</div>
<h2>Enviar proposta</h2><form class="card"><label for="c1">Cotação</label><select id="c1" name="cotacao" ${ab.length?'':'disabled'}>${ab.length?ab.map(c=>`<option>${esc(c.id+' · '+c.titulo)}</option>`).join(''):'<option>Sem cotações abertas</option>'}</select>
<label for="c2">Empresa ou prestador</label><input id="c2" name="empresa" required><label for="c3">E-mail</label><input id="c3" name="email" type="email" required><label for="c4">Mensagem</label><textarea id="c4" name="mensagem" rows="3"></textarea>
<p><small>A proposta em PDF deve ser enviada por e-mail${S.email?` para <b>${esc(S.email)}</b>`:''}, citando o número da cotação.</small></p><p><button class="btn" type="submit" ${ab.length?'':'disabled'}>Enviar proposta</button></p><input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px"><p class="st" role="status"></p></form>
<h2>Cotações encerradas</h2>${en.length?`<div class="card scroll"><table><tr><th>Cotação</th><th>Propostas</th><th>Vencedor</th><th>Valor</th></tr>${en.map(c=>`<tr><td>${esc(c.id+' · '+c.titulo)}</td><td>${esc(c.propostas)}</td><td>${esc(c.vencedor)}</td><td>${brl(c.valor)}</td></tr>`).join('')}</table></div>`:empty('Nenhuma cotação encerrada ainda.')}</div>`;
 bindForm($('form'),'proposta')},
ouvidoria(){
 app.innerHTML=`<div class="w"><h1>Ouvidoria e denúncias</h1><div class="grid"><form class="card" id="fc"><h3>Fale conosco</h3><label for="o1">Nome</label><input id="o1" name="nome" required><label for="o2">E-mail</label><input id="o2" name="email" type="email" required><label for="o3">Mensagem</label><textarea id="o3" name="mensagem" rows="4" required></textarea><p><button class="btn" type="submit">Enviar mensagem</button></p><input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px"><p class="st" role="status"></p></form>
<form class="card" id="fd" style="border-top:6px solid var(--b)"><h3>Canal de denúncias</h3><label><input type="checkbox" id="an"> Quero denunciar de forma anônima</label><div id="idn"><label for="d1">Nome</label><input id="d1" name="nome"><label for="d2">E-mail</label><input id="d2" name="email" type="email"></div><p><small>Ao marcar o anonimato, não pedimos nem registramos nome ou e-mail. Guarde o número de protocolo que aparece após o envio.</small></p><label for="d3">Descreva o fato</label><textarea id="d3" name="fato" rows="4" required></textarea><p><button class="btn" type="submit">Registrar denúncia</button></p><input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px"><p class="st" role="status"></p></form></div></div>`;
 $('#an').onchange=e=>{$('#idn').hidden=e.target.checked;$$('input',$('#idn')).forEach(i=>i.disabled=e.target.checked)};
 bindForm($('#fc'),'contato');bindForm($('#fd'),'denuncia')},
privacidade(){
 app.innerHTML=`<div class="w"><h1>Política de privacidade</h1><p class="empty">Texto-base. Deve ser revisado pela assessoria jurídica da FVLP antes da divulgação.</p>
<h2>Quais dados coletamos</h2><p>Apenas o que você escreve nos formulários de contato, de proposta de fornecedor e de denúncia (nome, e-mail e mensagem). Na denúncia anônima, nenhum dado de identificação é solicitado.</p>
<h2>Para que usamos</h2><p>Responder mensagens, avaliar propostas em cotações e apurar denúncias, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
<h2>Cookies e terceiros</h2><p>O site não usa cookies de publicidade nem de rastreamento. Guardamos no seu navegador só as preferências de tamanho de fonte e contraste. O tradutor de Libras (VLibras) e o serviço de formulários são fornecidos por terceiros.</p>
<h2>Seus direitos</h2><p>Você pode pedir acesso, correção ou exclusão dos seus dados${S.email?` pelo e-mail <b>${esc(S.email)}</b>`:' pelo canal de ouvidoria'}.</p></div>`},
404(){app.innerHTML=`<div class="w"><h1>Página não encontrada</h1><p><a href="/">Voltar ao início</a></p></div>`}
};
(P[page]||P[404])();
})();
