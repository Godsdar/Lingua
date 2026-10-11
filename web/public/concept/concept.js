(() => {
  const root = document.getElementById('lingua-concept');
  const fixtures = window.LINGUA_CONCEPT_DATA.sentences;
  const trees = window.LINGUA_CONCEPT_DATA.families;
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const relationNames={nsubj:'subject',obj:'direct object',iobj:'recipient',aux:'auxiliary',det:'determiner',root:'root','nmod:poss':'possessor','acl:relcl':'relative clause',advmod:'modifier',cop:'copula',punct:'punctuation'};
  const saved = {};
  const longText = 'Reading is easier when you can explore one small piece at a time.\n\n'+fixtures.examples.map(e=>e.text).join(' ')+'\n\nA longer document can contain many sentences, unfamiliar expressions, and words with several meanings. Instead of translating every paragraph and filling the screen with every possible analysis, choose the particular word or expression you want to understand. Keep the original context nearby. Save the explanation, grammatical relationships, and word history as a study note. Return to the document when you are ready to continue reading. In this prototype only the three prepared sentences have a detailed analysis; the surrounding text remains available for selection.';
  function shell(app){
    app.innerHTML=`<header class="lp-header"><div class="lp-brand"><img src="./favicon.svg" alt="" aria-hidden="true"><span>Lingua</span></div><span class="lp-label">a small space for understanding</span><div class="lp-theme" role="group" aria-label="Color theme"><button data-theme-choice="tokyo" aria-pressed="true" aria-label="Tokyo Night theme"><span class="lp-theme-swatch" style="--swatch:#7aa2f7" aria-hidden="true"></span>Tokyo Night</button><button data-theme-choice="light" aria-pressed="false" aria-label="Light theme"><span class="lp-theme-swatch" style="--swatch:#e0cda5" aria-hidden="true"></span>Light</button><button data-theme-choice="graphite" aria-pressed="false" aria-label="Graphite theme"><span class="lp-theme-swatch" style="--swatch:#afb5c0" aria-hidden="true"></span>Graphite</button></div></header><div class="lp-shell"><h2 class="lp-intro">Stay curious. One expression at a time.</h2><p class="lp-sub">Read the sentence. Follow a word. Find its story.</p><div class="lp-main-area"><section><div class="lp-editor-top"><label class="lp-label" for="${app.id}-input">English text · demo limit 6000 characters</label><span class="lp-label" data-ui="count"></span></div><textarea class="lp-editor" id="${app.id}-input" data-ui="input" spellcheck="false" maxlength="6000" aria-label="English text"></textarea><div class="lp-actions"><button class="lp-main" data-action="analyze">Explore text</button><button data-action="selection">Explore selection</button></div><div class="lp-examples"><span>Try</span><button data-example="mother-water">a word family</button><button data-example="present-perfect-progressive">a verb phrase</button><button data-example="relative-clause">a relative clause</button><button data-example="long">a longer text</button></div><div class="lp-status" data-ui="status" role="status" aria-live="polite"></div><div class="lp-section-label">Your reading</div><div class="lp-source" data-ui="source" aria-label="Select a word in the source text"></div><div data-ui="phrases" class="lp-phrase-row"></div></section><section><nav class="lp-tabs" aria-label="Analysis view"><button data-view="understand" aria-pressed="true">Understand</button><button data-view="grammar" aria-pressed="false">Grammar</button><button data-view="origins" aria-pressed="false">Word origins</button></nav><div data-ui="content"></div><div class="lp-actions"><button data-action="save">＋ Save this insight</button><button data-action="export">Export notes <span data-ui="note-count">0</span></button></div></section></div><section class="lp-notes" data-ui="notes" hidden></section><section class="lp-export" data-ui="export" hidden><div class="lp-actions"><h3 style="margin:0">Your study notes</h3><label class="lp-label">Format <select data-action="format"><option value="markdown">Markdown</option><option value="json">JSON</option><option value="html">HTML report</option></select></label><button data-action="download">Download report</button><button data-action="copy">Copy report</button><button data-action="close-export" aria-label="Close export">Close</button></div><p class="lp-label">Includes saved fragments, context, explanations, grammar, and available origin sources.</p><div class="lp-report-preview" data-ui="report-preview" hidden></div><textarea data-ui="report" readonly aria-label="Exported study report"></textarea><div class="lp-label" data-ui="copy-status" role="status" aria-live="polite"></div></section><footer class="lp-footer"><span>Concept demo · prepared examples · no live translation or parser</span><span>English → optional Russian translation</span></footer></div>`;
  }
  const instances=[];
  const persist = () => {};
  function init(app){
    shell(app);
    const q = selector => app.querySelector(selector);
    const ui = name => q(`[data-ui="${name}"]`);
    const s={text:typeof saved.text==='string'?saved.text.slice(0,6000):fixtures.examples[0].text,analyzed:'',theme:['tokyo','light','graphite'].includes(saved.theme)?saved.theme:'tokyo',view:['understand','grammar','origins'].includes(saved.view)?saved.view:'origins',start:19,end:24,context:null,token:null,phrase:null,notes:[],documents:{},treeSelected:'en',expanded:false,format:'markdown',animation:true,treeSvg:''};
    instances.push({app,s,draw:()=>render(app,s)});
    app.dataset.theme=s.theme;syncTheme(app,s);ui('input').value=s.text;
    function changeSelection(start,end){s.start=start;s.end=end;s.treeSelected='en';s.expanded=false;resolve(s);render(app,s);persist(s);}
    function analyze(){s.text=ui('input').value;s.analyzed=s.text;s.start=0;s.end=s.text.length;s.phrase=null;s.token=null;resolve(s);if(s.context){const example=s.context.example;const preferred=example.tokens.find(t=>t.lemma==='water')||example.tokens.find(t=>t.relation==='root');s.start=s.context.offset+preferred.start;s.end=s.context.offset+preferred.end;resolve(s);}if(wordCount(s.text)>50){s.start=0;s.end=0;resolve(s);}render(app,s);persist(s);}
    app.addEventListener('click',async event=>{
      const target=event.target.closest('button');if(!target)return;
      if(target.dataset.themeChoice){s.theme=target.dataset.themeChoice;app.dataset.theme=s.theme;syncTheme(app,s);drawTree(app,s);persist(s);return;}
      if(target.dataset.example){const id=target.dataset.example;ui('input').value=id==='long'?longText:fixtures.examples.find(e=>e.id===id).text;s.view=id==='mother-water'?'origins':'understand';analyze();return;}
      if(target.dataset.start!==undefined){if(s.text!==s.analyzed){ui('status').textContent='Explore the edited text before selecting from the previous reading.';return;}changeSelection(Number(target.dataset.start),Number(target.dataset.end));return;}
      if(target.dataset.phrase!==undefined){const phrase=s.context.example.phrases[Number(target.dataset.phrase)];changeSelection(s.context.offset+phrase.start,s.context.offset+phrase.end);s.view='understand';render(app,s);persist(s);return;}
      if(target.dataset.view){s.view=target.dataset.view;render(app,s);persist(s);return;}
      if(target.dataset.node){s.treeSelected=target.dataset.node;renderContent(app,s);persist(s);return;}
      if(target.dataset.remove){s.notes=s.notes.filter(n=>n.id!==target.dataset.remove);renderNotes(app,s);updateExport(app,s);return;}
      const action=target.dataset.action;
      if(action==='analyze'){analyze();return;}
      if(action==='selection'){
        const editor=ui('input');let start=editor.selectionStart,end=editor.selectionEnd;
        const selection=window.getSelection();if(start===end && selection && !selection.isCollapsed && ui('source').contains(selection.anchorNode)&&ui('source').contains(selection.focusNode)){const range=selection.getRangeAt(0),prefix=document.createRange();prefix.selectNodeContents(ui('source'));prefix.setEnd(range.startContainer,range.startOffset);start=prefix.toString().length;end=start+range.toString().length;}
        if(start===end){ui('status').textContent='Highlight a word or expression in the editor or reading text first.';return;}
        s.text=editor.value;s.analyzed=s.text;changeSelection(start,end);return;
      }
      if(action==='family'){s.expanded=!s.expanded;renderContent(app,s);return;}
      if(action==='save'){
        if(s.text!==s.analyzed){ui('status').textContent='Explore the edited text before saving an insight.';return;}
        if(s.end<=s.start){ui('status').textContent='Select a word or expression to save.';return;}
        const report=currentNote(s);if(s.notes.some(n=>n.key===report.key)){ui('status').textContent='This fragment is already in your notes.';return;}
        s.notes.push(report);s.documents[report.documentId]=s.text;renderNotes(app,s);ui('status').textContent='Insight saved for this demo session.';persist(s);return;
      }
      if(action==='export'){ui('export').hidden=false;updateExport(app,s);ui('export').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});return;}
      if(action==='close-export'){ui('export').hidden=true;return;}
      if(action==='download'){
        const mime={markdown:'text/markdown',json:'application/json',html:'text/html'}[s.format];
        const extension={markdown:'md',json:'json',html:'html'}[s.format];
        const blob=new Blob([ui('report').value],{type:mime+';charset=utf-8'});
        const url=URL.createObjectURL(blob),link=document.createElement('a');
        link.href=url;link.download='lingua-study-notes.'+extension;
        link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        ui('copy-status').textContent='Report download started.';return;
      }
      if(action==='copy'){
        const area=ui('report');try{await navigator.clipboard.writeText(area.value);ui('copy-status').textContent='Report copied.';}catch{area.focus();area.select();ui('copy-status').textContent='Report selected. Press ⌘C or Ctrl+C to copy.';}return;
      }
    });
    app.addEventListener('change',event=>{
      if(event.target.dataset.action==='format'){s.format=event.target.value;updateExport(app,s);}
    });
    ui('input').addEventListener('input',()=>{s.text=ui('input').value;ui('count').textContent=`${wordCount(s.text)} words${s.text.length>=6000?' · input limit reached':''}`;ui('status').textContent='Text changed. Explore text or a highlighted fragment to update the analysis.';ui('source').setAttribute('aria-disabled','true');q('[data-action="save"]').disabled=true;});
    ui('input').addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){event.preventDefault();analyze();}});
    s.analyzed=s.text;if(saved.start>=0&&saved.end<=s.text.length&&saved.end>saved.start){s.start=saved.start;s.end=saved.end;}
    resolve(s);if(!s.context && s.text===fixtures.examples[0].text){s.start=19;s.end=24;resolve(s);}render(app,s);
    const observer=new ResizeObserver(()=>{if(s.view==='origins')drawTree(app,s);});observer.observe(app);
  }
  function syncTheme(app,s){app.querySelectorAll('[data-theme-choice]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.themeChoice===s.theme));button.classList.add('cursor-interaction');});}
  function wordCount(text){return(text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)||[]).length;}
  function resolve(s){
    s.context=null;s.token=null;s.phrase=null;
    for(const example of fixtures.examples){let index=s.text.indexOf(example.text);while(index!==-1){if(s.start>=index&&s.end<=index+example.text.length){s.context={example,offset:index};break;}index=s.text.indexOf(example.text,index+1);}if(s.context)break;}
    if(!s.context){const fragment=s.text.slice(s.start,s.end).trim();for(const example of fixtures.examples){if(fragment===example.text){const offset=s.start+s.text.slice(s.start,s.end).indexOf(fragment);s.context={example,offset};break;}}}
    if(s.context){const offset=s.context.offset;s.token=s.context.example.tokens.find(t=>s.start===offset+t.start&&s.end===offset+t.end)||null;s.phrase=s.context.example.phrases.find(p=>s.start===offset+p.start&&s.end===offset+p.end)||null;}
    s.origin=s.token&&trees[s.token.lemma]?trees[s.token.lemma]:null;
  }
  function render(app,s){
    app.classList.toggle('lp-animation',s.animation);
    const ui=name=>app.querySelector(`[data-ui="${name}"]`);ui('count').textContent=`${wordCount(s.text)} words${s.text.length>=6000?' · input limit reached':''}`;
    const long=wordCount(s.text)>50;
    ui('source').removeAttribute('aria-disabled');
    ui('status').textContent=long?'Long-text mode · choose a word or highlight an expression. Only prepared sentences have demo analysis.':s.context?'Prepared example · select a word or a suggested expression.':'No prepared analysis for this fragment. Your text stays selectable; try one of the examples.';
    const matcher=/[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu;let last=0,html='';
    for(const match of s.text.matchAll(matcher)){const start=match.index,end=start+match[0].length;html+=esc(s.text.slice(last,start));const active=start<s.end&&end>s.start;html+=`<button data-start="${start}" data-end="${end}" aria-pressed="${active}" aria-label="Explore ${esc(match[0])}, position ${start}">${esc(match[0])}</button>`;last=end;}
    html+=esc(s.text.slice(last));ui('source').innerHTML=html||'<span class="lp-muted">Your text will appear here.</span>';
    ui('phrases').innerHTML=s.context?s.context.example.phrases.map((p,i)=>`<button data-phrase="${i}">${esc(p.text)} ↗</button>`).join(''):'';
    app.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===s.view)));
    app.querySelector('[data-action="save"]').disabled=s.text!==s.analyzed||!s.text.trim()||s.end<=s.start;
    app.querySelectorAll('button,select,summary').forEach(control=>control.classList.add('cursor-interaction'));
    renderContent(app,s);renderNotes(app,s);
  }
  function inspector(s){
    const selected=s.text.slice(s.start,s.end);
    if(s.phrase)return `<aside class="lp-inspector"><div class="lp-label">Selected expression</div><p class="lp-word">${esc(selected)}</p><p>${esc(s.phrase.explanation.replace('Handcrafted demo: ',''))}</p><span class="lp-label">Offsets ${s.start}–${s.end} · prepared explanation</span></aside>`;
    if(!s.token)return `<aside class="lp-inspector"><div class="lp-label">Selected fragment</div><p class="lp-word">${esc(selected||'Choose a word')}</p><p class="lp-muted">${s.context?'Select one word for its grammatical features, or a suggested expression.':'Grammar and word history are not available for this fragment in the demo.'}</p></aside>`;
    const t=s.token,head=t.head?s.context.example.tokens[t.head-1].text:'sentence root';
    return `<aside class="lp-inspector"><div class="lp-label">Selected word</div><p class="lp-word">${esc(t.text)}</p><span class="lp-label">${esc(t.pos)} · lemma ${esc(t.lemma)}</span><dl><div><dt>Relation</dt><dd>${esc(t.relation)}</dd></div><div><dt>Head</dt><dd>${esc(head)}</dd></div>${Object.entries(t.features).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p>${esc(t.explanation)}</p><span class="lp-label">Offsets ${s.start}–${s.end} · prepared analysis</span></aside>`;
  }
  function renderContent(app,s){
    const area=app.querySelector('[data-ui="content"]');
    if(s.view==='understand'){
      area.innerHTML=`<div class="lp-panels"><div class="lp-understand"><div class="lp-section-label" style="margin-top:0">${s.phrase?'The expression':'The sentence'}</div><h3>${s.phrase?'A small phrase. A useful pattern.':s.context?'What is happening here?':'Choose a small piece to explore'}</h3><p>${esc(s.phrase?s.phrase.explanation.replace('Handcrafted demo: ',''):s.context?s.context.example.explanation.replace('Handcrafted demo: ',''):'This concept uses three prepared examples. It does not generate an explanation or translation for arbitrary pasted text.')}</p>${s.context?`<details class="lp-translation"><summary>Russian translation · prepared example</summary><p style="margin-top:10px">${esc(s.context.example.translation)}</p></details>`:''}</div>${inspector(s)}</div>`;
    }else if(s.view==='grammar'){
      area.innerHTML=`<div class="lp-panels"><div><div class="lp-section-label" style="margin-top:0">Dependency relationships</div><h3>How the words work together</h3>${s.context?`<div class="lp-dependencies">${s.context.example.tokens.filter(t=>t.pos!=='PUNCT').map(t=>`<div class="lp-dep ${s.token===t?'is-current':''}"><span>${esc(t.text)}</span><span class="lp-relation">${esc(relationNames[t.relation]||t.relation)} →</span><span>${esc(t.head?s.context.example.tokens[t.head-1].text:'root')}</span></div>`).join('')}</div><p class="lp-label" style="margin-top:12px">Dependent → head · UD-style labels · prepared analysis</p>`:'<p class="lp-empty">No prepared dependency analysis for this text. Try a demo sentence or select a word inside one.</p>'}</div>${inspector(s)}</div>`;
    }else{
      area.innerHTML=s.origin?`<div class="lp-panels"><div><div class="lp-section-label" style="margin-top:0">${esc(s.token.lemma)} · a word family</div><h3>Different words. A shared history.</h3><div class="lp-tree" data-ui="tree" aria-label="Word family tree"></div><div class="lp-family" data-ui="family"></div><div class="lp-actions"><button data-action="family">${s.expanded?'Less detail':'More relatives'}</button></div><p class="lp-tree-caption">Oldest available form below · modern forms above · some historical steps condensed</p></div><aside class="lp-inspector" data-ui="tree-detail"></aside></div>`:`<div class="lp-panels"><div><h3>Every word deserves a careful story.</h3><p class="lp-muted">${s.phrase?'An expression does not have one word genealogy. Select a word within it to explore its origin.':'This demo includes verified families for water and mother. No history is invented for the other words.'}</p><button data-example="mother-water">Explore water and mother ↗</button></div>${inspector(s)}</div>`;
      drawTree(app,s);
    }
  }
  function drawTree(app,s){
    const container=app.querySelector('[data-ui="tree"]');if(!container||!s.origin)return;
    const width=Math.max(180,container.clientWidth),narrow=width<470;
    const graph=s.origin.nodes;let leaves=graph.filter(n=>!graph.some(child=>child.parent===n.id));
    if(!s.expanded||narrow)leaves=leaves.filter(n=>['en','de','ru'].some(lang=>n.id.endsWith('-'+lang)));
    if(!leaves.length)leaves=graph.filter(n=>!graph.some(child=>child.parent===n.id)).slice(0,3);
    const keep=new Set(leaves.map(n=>n.id));for(const leaf of leaves){let node=leaf;while(node.parent){keep.add(node.parent);node=graph.find(n=>n.id===node.parent);if(!node)break;}}
    const active=graph.filter(n=>keep.has(n.id)),positions={};
    leaves.forEach((n,i)=>positions[n.id]={x:50+(width-100)*(leaves.length===1?.5:i/(leaves.length-1)),y:55});
    function depth(node){return node.parent?1+depth(graph.find(n=>n.id===node.parent)):0;}
    const maxDepth=Math.max(...active.map(depth));
    function pos(node){if(positions[node.id])return positions[node.id];const children=active.filter(n=>n.parent===node.id);const points=children.map(pos);return positions[node.id]={x:points.reduce((sum,p)=>sum+p.x,0)/points.length,y:55+(maxDepth-depth(node))*(330/maxDepth)};}
    active.forEach(pos);
    const selected=graph.find(n=>n.id===s.treeSelected)||leaves.find(n=>n.id.endsWith('-en'))||leaves[0];const ancestry=new Set([selected.id]);let a=selected;while(a.parent){ancestry.add(a.parent);a=graph.find(n=>n.id===a.parent);if(!a)break;}
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 470" role="img" aria-label="Etymological family of ${esc(s.token.lemma)}"><title>${esc(s.token.lemma)}: ancestors below, descendants above</title>`;
    for(const node of active){if(!node.parent)continue;const from=positions[node.parent],to=positions[node.id],highlight=ancestry.has(node.id)&&ancestry.has(node.parent);const weight=Math.max(1.5,5-depth(node)*1.1);svg+=`<path d="M${from.x},${from.y-16} C${from.x},${from.y-70} ${to.x},${to.y+70} ${to.x},${to.y+21}" fill="none" stroke="${highlight?'var(--lp-accent)':'var(--lp-line)'}" stroke-width="${weight}" stroke-linecap="round"/>`;}
    const base=active.find(n=>!n.parent),bp=positions[base.id];for(const direction of [-1,0,1])svg+=`<path d="M${bp.x},${bp.y+32} Q${bp.x+direction*17},${bp.y+48} ${bp.x+direction*32},${bp.y+62}" stroke="var(--lp-line)" stroke-width="2" fill="none"/>`;
    svg+='</svg>';s.treeSvg=svg;container.innerHTML=svg+active.map(node=>`<button class="lp-tree-label ${node.id===selected.id?'is-current':''} ${!node.parent?'is-root':''}" data-node="${esc(node.id)}" style="left:${positions[node.id].x}px;top:${positions[node.id].y}px;width:${!node.parent?115:leaves.some(leaf=>leaf.id===node.id)?Math.min(94,(width-100)/Math.max(1,leaves.length-1)-8):Math.min(94,width/3)}px" aria-label="${esc(node.label)}, ${esc(node.lang)}"><span class="lp-form">${esc(node.label)}</span><span class="lp-lang">${esc(node.lang)}</span></button>`).join('');
    const family=app.querySelector('[data-ui="family"]');family.innerHTML=narrow&&s.expanded?graph.filter(n=>!graph.some(c=>c.parent===n.id)).map(n=>`<button data-node="${esc(n.id)}">${esc(n.label)} · ${esc(n.lang)}</button>`).join(''):'';
    const detail=app.querySelector('[data-ui="tree-detail"]');detail.innerHTML=`<div class="lp-label">${selected.reconstructed?'Reconstructed ancestor':'Selected family member'}</div><p class="lp-word">${esc(selected.label)}</p><span class="lp-label">${esc(selected.lang)}</span><p style="margin-top:16px">${esc(selected.gloss||s.origin.note)}</p><p class="lp-label">${selected.condensed?'Condensed path: '+esc(selected.skipped.join('; ')):'A sourced step in this word family.'}</p><details><summary class="lp-label">About this family</summary><p class="lp-label">${esc(s.origin.note)}</p></details><a href="${esc(selected.source)}" target="_blank" rel="noreferrer">Wiktionary source ↗</a><p class="lp-label" style="margin-top:14px">Wiktionary · CC BY-SA · prepared family</p>`;
  }
  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16);}
  function currentNote(s){
    const documentId=hash(s.text),selectedText=s.text.slice(s.start,s.end),context=s.context?s.context.example.text:selectedText,explanation=s.phrase?s.phrase.explanation:s.token?s.token.explanation:s.context?s.context.example.explanation:null;
    return{id:`note-${Date.now()}-${s.notes.length}`,key:`${documentId}:${s.start}:${s.end}`,documentId,selectedText,start:s.start,end:s.end,context,contextStart:s.context?s.context.offset:s.start,explanation,translation:s.context?s.context.example.translation:null,grammar:s.token?{lemma:s.token.lemma,pos:s.token.pos,features:s.token.features,head:s.token.head?s.context.example.tokens[s.token.head-1].text:null,relation:s.token.relation}:null,dependencies:s.context?s.context.example.tokens.map((t,i)=>({...t,id:i+1,start:t.start+s.context.offset,end:t.end+s.context.offset})):[],phrase:s.phrase?{text:s.phrase.text,explanation:s.phrase.explanation}:null,origin:s.origin?{word:s.token.lemma,nodes:s.origin.nodes,note:s.origin.note,sources:s.origin.sources,attribution:s.origin.attribution,verifiedOn:s.origin.verifiedOn}:null,provenance:'Prepared concept demo. No live NLP analysis.',status:s.context?'prepared example':'unavailable',scope:s.phrase?'expression':s.token?'word':'fragment'};
  }
  function reportTree(origin,reportWidth=720){
    const graph=origin.nodes,width=Math.max(220,reportWidth),positions={};
    let leaves=graph.filter(n=>!graph.some(c=>c.parent===n.id));
    if(width<600)leaves=leaves.filter(n=>['en','de','ru'].some(lang=>n.id.endsWith('-'+lang)));
    const keep=new Set(leaves.map(n=>n.id));for(const leaf of leaves){let n=leaf;while(n.parent){keep.add(n.parent);n=graph.find(a=>a.id===n.parent);}}
    const active=graph.filter(n=>keep.has(n.id));
    const depth=node=>node.parent?1+depth(graph.find(n=>n.id===node.parent)):0,maxDepth=Math.max(...graph.map(depth));
    leaves.forEach((n,i)=>positions[n.id]={x:56+i*(width-112)/(leaves.length-1),y:42});
    function position(node){if(positions[node.id])return positions[node.id];const children=active.filter(n=>n.parent===node.id).map(position);return positions[node.id]={x:children.reduce((sum,p)=>sum+p.x,0)/children.length,y:42+(maxDepth-depth(node))*82};}
    active.forEach(position);
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 435" role="img" aria-label="Word family of ${esc(origin.word)}" style="color:inherit"><title>${esc(origin.word)}: historical ancestors below, modern relatives above</title>`;
    active.forEach(node=>{if(!node.parent)return;const from=positions[node.parent],to=positions[node.id];svg+=`<path d="M${from.x},${from.y-16} C${from.x},${from.y-58} ${to.x},${to.y+58} ${to.x},${to.y+22}" stroke="currentColor" stroke-opacity=".35" stroke-width="2" fill="none"/>`;});
    active.forEach(node=>{const p=positions[node.id],words=node.lang.split(' '),lines=words.length>1?[words.slice(0,-1).join(' '),words.at(-1)]:[node.lang];svg+=`<text x="${p.x}" y="${p.y}" fill="currentColor" text-anchor="middle" font-family="system-ui,sans-serif" font-size="17">${esc(node.label)}</text><text x="${p.x}" y="${p.y+17}" fill="currentColor" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12">${lines.map((line,i)=>`<tspan x="${p.x}" dy="${i?14:0}">${esc(line)}</tspan>`).join('')}</text>`;});
    return svg+'</svg>';
  }
  function reportArticles(list,reportWidth=720){return list.map(n=>`<article><h2>${esc(n.selectedText)}</h2><small>${esc(n.scope)} · source ${n.documentId} · positions ${n.start}–${n.end} (UTF-16, end-exclusive)</small><blockquote>${esc(n.context)}</blockquote><p>${esc(n.explanation||'No prepared explanation available.')}</p>${n.translation?`<p>Russian translation of context: ${esc(n.translation)}</p>`:''}${n.grammar?`<p><strong>${esc(n.grammar.pos)}</strong> · lemma ${esc(n.grammar.lemma)} · ${esc(n.grammar.relation)} → ${esc(n.grammar.head||'root')}</p><p>${esc(Object.entries(n.grammar.features).map(([k,v])=>k+': '+v).join(' · '))}</p>`:''}${n.dependencies.length?`<details><summary>Grammar of the context sentence</summary><table><thead><tr><th>Word</th><th>Relation → head</th><th>Features</th></tr></thead><tbody>${n.dependencies.filter(t=>t.pos!=='PUNCT').map(t=>`<tr><td>${esc(t.text)}<br><small>${esc(t.pos)} · ${esc(t.lemma)}</small></td><td>${esc(t.relation)} → ${esc(t.head?n.dependencies[t.head-1].text:'root')}</td><td>${esc(Object.entries(t.features).map(([k,v])=>k+': '+v).join(', '))}</td></tr>`).join('')}</tbody></table></details>`:''}${n.origin?`<h3>Word family</h3>${reportTree(n.origin,reportWidth)}<small>Ancestors below · relatives above · some historical stages condensed</small><p>${esc(n.origin.note)}</p><details><summary>Forms and historical sources</summary><table><thead><tr><th>Form / language</th><th>Historical path</th><th>Source</th></tr></thead><tbody>${n.origin.nodes.map(node=>`<tr><td>${esc(node.label)}<br>${esc(node.lang)}</td><td>${esc(node.skipped.length?node.skipped.join(' → '):node.parent?'Sourced historical step':'Oldest form in this example')}</td><td><a href="${esc(node.source)}" target="_blank" rel="noreferrer">Entry</a>${node.edgeSource?` · <a href="${esc(node.edgeSource)}" target="_blank" rel="noreferrer">Relation</a>`:''}</td></tr>`).join('')}</tbody></table></details><small>${esc(n.origin.attribution)} · checked ${esc(n.origin.verifiedOn)} · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">License</a></small>`:''}</article>`).join('');}
  function renderNotes(app,s){const notes=app.querySelector('[data-ui="notes"]');notes.hidden=!s.notes.length;notes.innerHTML=`<div class="lp-section-label" style="margin-top:0">Study notes · this session</div>${s.notes.map(n=>`<div class="lp-note"><div><strong>${esc(n.selectedText)}</strong><div class="lp-label">${esc(n.scope)} · ${n.start}–${n.end} · ${esc(n.status)}</div></div><button data-remove="${esc(n.id)}" aria-label="Remove note ${esc(n.selectedText)}">Remove</button></div>`).join('')}`;app.querySelector('[data-ui="note-count"]').textContent=s.notes.length;}
  function updateExport(app,s){
    const list=s.notes.length?s.notes:[currentNote(s)];let output='';
    if(s.format==='json'){const documents={...s.documents,[hash(s.text)]:s.text};output=JSON.stringify({schemaVersion:1,language:'en',coordinateSystem:'UTF-16, end-exclusive',provenance:'Prepared examples; no live translation or parser',documents,notes:list},null,2);}
    else if(s.format==='markdown'){output='# Lingua study notes\n\nPrepared concept demo; no live parser or translator. Positions use UTF-16, end-exclusive.\n\n'+list.map(n=>`## ${n.selectedText}\n\nSource: ${n.documentId}, positions ${n.start}–${n.end}. Scope: ${n.scope}.\n\nContext: ${n.context}\n\n${n.explanation||'No prepared explanation available.'}\n\n${n.translation?'Russian translation of the context: '+n.translation+'\n\n':''}${n.grammar?'Grammar: '+n.grammar.pos+', lemma '+n.grammar.lemma+', relation '+n.grammar.relation+', head '+(n.grammar.head||'root')+'.\nFeatures: '+JSON.stringify(n.grammar.features)+'\n\n':''}${n.dependencies.length?'Context dependencies (dependent → head):\n'+n.dependencies.filter(t=>t.pos!=='PUNCT').map(t=>'- '+t.text+' ('+t.pos+'): '+t.relation+' → '+(t.head?n.dependencies[t.head-1].text:'root')).join('\n')+'\n\n':''}${n.origin?'Word history: '+n.origin.note+'\n'+n.origin.nodes.map(node=>`- ${node.lang}: ${node.label}. ${node.skipped.length?'Condensed stages: '+node.skipped.join(' → ')+'. ':''}Entry: ${node.source}. Relation: ${node.edgeSource||node.source}`).join('\n')+'\n\nEnglish Wiktionary contributors — CC BY-SA 4.0. License: https://creativecommons.org/licenses/by-sa/4.0/\n':''}`).join('\n');}
    else {output='<'+'!doctype html>\n'+'<'+'html lang="en"><meta charset="utf-8"><title>Lingua study notes</title><style>body{font:16px/1.6 system-ui;max-width:850px;margin:40px auto;padding:20px;color:#263244;background:#fff}article{border-top:1px solid #ddd;padding:20px 0}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:8px;border-bottom:1px solid #eee;overflow-wrap:anywhere}small{color:#556}svg{max-width:100%;height:auto}details{margin:16px 0}@media(max-width:540px){svg{display:none}details>table{display:table}}@media print{body{margin:0}details>table{display:table}svg{break-inside:avoid}}</style><h1>Lingua study notes</h1><p>Prepared concept demo; no live parser or translator.</p>'+reportArticles(list)+'</html>';}
    const preview=app.querySelector('[data-ui="report-preview"]');preview.hidden=s.format!=='html';preview.innerHTML=s.format==='html'?reportArticles(list,preview.clientWidth):'';
    app.querySelector('[data-ui="report"]').value=output;app.querySelector('[data-ui="copy-status"]').textContent=s.notes.length?`${s.notes.length} saved ${s.notes.length===1?'insight':'insights'} in the report.`:'No saved notes yet: exporting the current selection.';
  }
  root.querySelectorAll('.lp').forEach(init);
})();
(() => {
  const layouts=document.querySelectorAll('[data-variant]');
  document.querySelectorAll('[data-layout-choice]').forEach(button=>button.addEventListener('click',()=>{
    layouts.forEach(layout=>{layout.hidden=layout.dataset.variant!==button.dataset.layoutChoice;});
    document.querySelectorAll('[data-layout-choice]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));
  }));
})();

