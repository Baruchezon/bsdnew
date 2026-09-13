const PRIMARY_PHONE_DISPLAY='08-6335333';const PRIMARY_PHONE_HREF='086335333';const LOGO='https://media.easy.co.il/images/UserThumbs/10143668_1752242943315_0.png';
function normalizePhones(){const re=/(?:054[\s-]*909[\s-]*1504|050[\s-]*742[\s-]*6263|08[\s-]*633[\s-]*5333)/g;document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href='tel:'+PRIMARY_PHONE_HREF;a.textContent=PRIMARY_PHONE_DISPLAY;a.setAttribute('dir','ltr');a.classList.add('phone-ltr')});const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(n=>{const p=n.parentElement;if(!p||p.closest('a[href^="tel:"]')||['SCRIPT','STYLE'].includes(p.tagName))return;const text=n.nodeValue;re.lastIndex=0;if(!re.test(text))return;re.lastIndex=0;const frag=document.createDocumentFragment();let last=0;for(const m of text.matchAll(re)){frag.append(document.createTextNode(text.slice(last,m.index)));const bdi=document.createElement('bdi');bdi.className='phone-ltr';bdi.dir='ltr';bdi.textContent=PRIMARY_PHONE_DISPLAY;frag.append(bdi);last=m.index+m[0].length}frag.append(document.createTextNode(text.slice(last)));n.replaceWith(frag)})}
function normalizeBrand(){document.querySelectorAll('.nav .brand').forEach(brand=>{if(!brand.querySelector('img')){const img=document.createElement('img');img.src=LOGO;img.alt='';brand.prepend(img)}if(!brand.querySelector('strong')){const s=document.createElement('strong');s.textContent='מרכז עדן';brand.appendChild(s)}});document.querySelectorAll('.menu a[href*="eden-baby"]').forEach(a=>a.textContent='שחיית תינוקות');document.querySelectorAll('.menu a').forEach(a=>{const here=location.pathname.split('/').pop()||'index.html';const there=a.getAttribute('href').split('/').pop();if(here===there)a.classList.add('active')})}
function improveHeroCard(){const quick=document.querySelector('.heroCard .quick');if(quick){quick.innerHTML='<a href="team.html">צוות מקצועי ומנוסה</a><a href="pools.html">בריכות איכותיות ובקרה שוטפת</a><a href="about.html">ליווי אישי ורצף טיפולי</a>'}document.querySelectorAll('.crm').forEach(el=>{const section=el.closest('section');if(section)section.remove();else el.remove()})}
function addWelcomeThought(){const file=location.pathname.split('/').pop()||'index.html';if(file!=='index.html'&&file!=='')return;const actions=document.querySelector('.heroCopy .actions');if(!actions||document.querySelector('.welcomeThought'))return;const thoughts=['לפעמים הצעד הכי גדול מתחיל בטיפה קטנה','לכל ילד יש את הקצב שלו, אנחנו כאן כדי ללוות אותו','כל התקדמות קטנה היא עולם שלם','שינוי אמיתי מתחיל במקום שמרגישים בו שמבינים אותך','במרכז עדן רואים קודם את האדם, ורק אחר כך את הקושי','לפעמים כל מה שצריך הוא סביבה נכונה ואדם שמאמין בך','מים, אמון, סבלנות, ומשם מתחילה הדרך','כל ילד צריך מקום שבו מאמינים ביכולת שלו','הדרך להתקדמות מתחילה בתחושת ביטחון','אנחנו לא ממהרים את התהליך, אנחנו מלווים אותו','מקום מקצועי יכול גם להרגיש כמו בית','במים אפשר לגלות יכולות שלא תמיד רואים על היבשה','לכל משפחה מגיע להרגיש שיש מי שהולך איתה בדרך','לפעמים החיוך הראשון במים אומר יותר מאלף מילים','לא כל דרך נראית אותו דבר, וזה בדיוק היופי שבה','במרכז עדן כל אדם מקבל מקום, זמן ודרך משלו'];let previous=-1;try{if(window.EdenPrivacy?.allowsPreferences())previous=Number(sessionStorage.getItem('edenThoughtIndex')??-1)}catch(e){}let index=Math.floor(Math.random()*thoughts.length);if(thoughts.length>1&&index===previous)index=(index+1)%thoughts.length;try{if(window.EdenPrivacy?.allowsPreferences())sessionStorage.setItem('edenThoughtIndex',String(index))}catch(e){}const el=document.createElement('div');el.className='welcomeThought';el.setAttribute('aria-live','polite');el.innerHTML='<span class="welcomeSpark">✦</span><span>'+thoughts[index]+'</span><span class="welcomeSpark">✦</span>';actions.insertAdjacentElement('afterend',el)}
function addWhyEden(){const file=location.pathname.split('/').pop()||'index.html';if(['index.html','','contact.html','privacy.html','accessibility.html','terms.html','reviews.html'].includes(file)||document.querySelector('.whyEden'))return;const map={
'about.html':['למה משפחות בוחרות במרכז עדן','הייחוד של מרכז עדן הוא בשילוב בין סביבת מים מקצועית, צוות שמכיר את האדם ולא רק את הטיפול, התאמה אישית ושמירה על רצף ברור לאורך הדרך.',['גישה אישית ולא תבנית קבועה','בריכות ייעודיות וסביבה מוקפדת','צוות מקצועי ויחס משפחתי']],
'services.html':['לא רק מגוון טיפולים, אלא התאמה נכונה','אנחנו לא מתחילים משם הטיפול אלא מהצורך. המטרה היא להתאים את סוג הפעילות, הקצב והמסגרת לאדם שמגיע אלינו.',['התאמה לפי גיל ויכולת','קבוצות קטנות ויחס אישי','רצף בין תחומי טיפול ופעילות']],
'hydrotherapy-children.html':['היתרון של מרכז עדן לילדים','העבודה משלבת מקצועיות עם סביבה נעימה ולא מאיימת. הילד מתקדם בקצב שלו, עם צוות שמחפש לבנות ביטחון, קשר וחוויות הצלחה.',['קצב אישי','סביבה מוכרת ומרגיעה','שיתוף ההורים בהתאם לצורך']],
'hydrotherapy-adults.html':['מים, תנועה והתאמה אישית','במרכז עדן המבוגר אינו נכנס לתכנית אחידה. הפעילות נבנית לפי היכולת, התחושה והמטרה האישית, בסביבה שקטה ומבוקרת.',['עומס מותאם','יחס אישי','בריכות חמימות ונעימות']],
'therapeutic-swimming.html':['ללמוד ולהתקדם בלי לחץ','השחייה הטיפולית במרכז עדן משלבת לימוד מיומנויות מים עם תהליך אישי שמכבד את הקצב, הביטחון והיכולת.',['התקדמות הדרגתית','חיזוק ביטחון במים','ליווי מקצועי אישי']],
'eden-baby.html':['מה מיוחד בשחיית התינוקות של Eden Baby','הפעילות נבנית כחוויה משותפת של הורה ותינוק. הדגש הוא על קשר, היכרות נעימה עם המים, תנועה, משחק וביטחון, בקבוצות קטנות ובאווירה חמה.',['הורה ותינוק יחד','קבוצה קטנה ויחס אישי','היכרות הדרגתית עם המים']],
'pools.html':['הבריכה היא חלק מהאיכות','במרכז עדן סביבת המים היא חלק בלתי נפרד מהשירות. אנחנו מקפידים על תחזוקה, ניקיון, בקרה ואיכות מים בהתאם להנחיות משרד הבריאות ולדרישות הרלוונטיות.',['איכות מים ובקרה','תחזוקה שוטפת','סביבה מותאמת לפעילות']],
'team.html':['צוות שמכיר את האדם שמאחורי הטיפול','המקצועיות חשובה, אבל גם הקשר. צוות מרכז עדן פועל מתוך הקשבה, סבלנות, התאמה ושיתוף פעולה, כדי ליצור תהליך רציף ונעים.',['הכשרות מקצועיות','ניסיון מעשי','יחס אישי ומשפחתי']],
'autism.html':['הייחוד של מרכז עדן בהתאמה על הרצף','אין תבנית אחת שמתאימה לכולם. אנחנו מתאימים את הקצב, הסביבה, אופן ההיכרות עם המים והמסגרת לאדם עצמו, לילד, לנער או למבוגר.',['קצב אישי','סביבה מוכרת ככל שניתן','רצף ושיתוף המשפחה']],
'knowledge.html':['ידע שעוזר למשפחות להבין ולבחור','מרכז הידע נועד לתת הסברים ברורים לפני שמקבלים החלטה. אנחנו מאמינים שמשפחה שמבינה את התהליך יכולה לבחור נכון יותר ולהגיע רגועה יותר.',['תוכן מקצועי ברור','שאלות שהורים באמת שואלים','חיבור ישיר לעמודי הטיפול']]
};const data=map[file];if(!data)return;const [title,text,items]=data;const section=document.createElement('section');section.className='section alt whyEden';section.innerHTML=`<div class="container"><h2 class="title center">${title}</h2><p class="lead center">${text}</p><div class="featureGrid">${items.map(i=>`<div class="feature"><strong>${i}</strong><span>חלק מהגישה של מרכז עדן שמעמידה את האדם, הביטחון וההתאמה האישית במרכז.</span></div>`).join('')}</div><p class="center" style="margin-top:1.2rem"><a class="btn light" href="contact.html">לשיחת התאמה עם מרכז עדן</a></p></div>`;const footer=document.querySelector('footer');if(footer)(document.querySelector('main')||footer.parentElement).appendChild(section)}
normalizePhones();normalizeBrand();improveHeroCard();addWelcomeThought();addWhyEden();
const menuBtn=document.querySelector('.mobileBtn');const menu=document.querySelector('.menu');if(menuBtn&&menu){menuBtn.addEventListener('click',()=>{menu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',menu.classList.contains('open'))});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}))}
async function sendLeadEmailNotification(){
  const response=await fetch('https://formsubmit.co/ajax/batyamit99@gmail.com',{
    method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},
    body:JSON.stringify({_subject:'פנייה חדשה באתר מרכז עדן',_template:'table',_captcha:'false',
      'הודעה':'התקבלה פנייה חדשה. לצפייה בפרטים יש להיכנס למערכת המרכז בהרשאה מתאימה. אין פרטים אישיים בהתראה זו.'})
  });
  if(!response.ok)throw new Error('notification');
}
document.querySelectorAll('[data-lead-form]').forEach(form=>{
form.addEventListener('submit',async e=>{
  e.preventDefault();
  form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  const phoneInput=form.querySelector('[name=phone]');
  const nameInput=form.querySelector('[name=parentName]');
  const digits=phoneInput.value.replace(/\D/g,'');
  phoneInput.setCustomValidity(digits.length>=7&&digits.length<=15?'':'נא להזין מספר טלפון תקין, הכולל 7 עד 15 ספרות.');
  nameInput.setCustomValidity(nameInput.value.trim()?'':'נא להזין שם כדי שנוכל לחזור אליכם.');
  for(const input of [phoneInput,nameInput])input.addEventListener('input',()=>{input.setCustomValidity('');input.removeAttribute('aria-invalid')},{once:true});
  if(!form.reportValidity()){form.querySelectorAll(':invalid').forEach(el=>el.setAttribute('aria-invalid','true'));return;}
  const msg=form.querySelector('.formMsg');
  const btn=form.querySelector('button[type=submit]');
  if(btn.disabled)return;
  const data=Object.fromEntries(new FormData(form).entries());
  if(data.website)return;
  if(data.contactConsent!=='yes')return;
  data.source='website-v2';
  data.sourcePage=location.origin+location.pathname;
  data.fullName=data.childName||data.fullName||data.parentName;
  data.privacyVersion='2026-09-13';
  data.contactConsentAt=new Date().toISOString();
  msg.className='formMsg';msg.textContent='';btn.disabled=true;btn.textContent='שולחים את הפנייה...';
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),30000);
  try{
    const r=await fetch('https://eden-center-crm.onrender.com/api/public/leads',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal,credentials:'omit'
    });
    const result=await r.json();
    if(!r.ok||result?.ok!==true)throw new Error('crm');
    msg.className='formMsg ok';msg.textContent='תודה! הפנייה התקבלה בהצלחה. צוות מרכז עדן יחזור אליכם בהקדם.';
    form.reset();
    // A notification failure must not turn an accepted lead into an error or cause duplicate submissions.
    if(!result.duplicate)void sendLeadEmailNotification().catch(()=>{});
  }catch(err){
    msg.className='formMsg bad';msg.innerHTML='לא התקבל אישור קליטה. כדי להימנע מפנייה כפולה, אפשר לברר בטלפון <a href="tel:'+PRIMARY_PHONE_HREF+'"><bdi dir="ltr">'+PRIMARY_PHONE_DISPLAY+'</bdi></a>.';
  }finally{clearTimeout(timeout);btn.disabled=false;btn.textContent='שליחת פנייה למרכז עדן';msg.focus({preventScroll:true});}
});
const fields=form.querySelector('.lead-fields');if(fields)fields.disabled=false;
form.querySelector('.form-fallback')?.setAttribute('hidden','');
});
// cooking-baking-nav
(function addCookingBakingNav(){
  document.querySelectorAll('.menu').forEach(menu=>{
    if(menu.querySelector('a[href="cooking-baking.html"]')) return;
    const a=document.createElement('a');
    a.href='cooking-baking.html';
    a.textContent='בישול ואפייה';
    const services=menu.querySelector('a[href="services.html"]');
    if(services) services.insertAdjacentElement('afterend',a); else menu.appendChild(a);
    const here=location.pathname.split('/').pop()||'index.html';
    if(here==='cooking-baking.html') a.classList.add('active');
  });
})();

