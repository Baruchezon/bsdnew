(function(){
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='language-switch.css?v=20260920-prod1';
  document.head.appendChild(css);
  const bilingual=document.createElement('link');bilingual.rel='stylesheet';bilingual.href='site-ru.css?v=20260921-prod1';document.head.appendChild(bilingual);
  const map={
    'index.html':'index-ru.html','about.html':'about-ru.html','accessibility.html':'accessibility-ru.html',
    'autism.html':'autism-ru.html','contact.html':'contact-ru.html','cooking-baking.html':'cooking-baking-ru.html',
    'eden-baby.html':'eden-baby-ru.html','hydrotherapy-adults.html':'hydrotherapy-adults-ru.html',
    'hydrotherapy-children.html':'hydrotherapy-children-ru.html','knowledge.html':'knowledge-ru.html',
    'pools.html':'pools-ru.html','privacy.html':'privacy-ru.html','reviews.html':'reviews-ru.html',
    'services.html':'services-ru.html','team.html':'team-ru.html','terms.html':'terms-ru.html',
    'therapeutic-swimming.html':'therapeutic-swimming-ru.html'
  };
  const here=location.pathname.split('/').pop()||'index.html';
  const target=map[here]||'index-ru.html';
  const navrow=document.querySelector('.nav .navrow');
  if(!navrow||navrow.querySelector('.prodLangSwitch,.langSwitch'))return;
  const sw=document.createElement('div');
  sw.className='prodLangSwitch';
  sw.setAttribute('aria-label','בחירת שפה');
  sw.innerHTML='<a class="active" href="'+here+'" lang="he">עברית</a><a href="'+target+'" lang="ru">Русский</a>';
  const social=navrow.querySelector('.edenSocialLinks');
  if(social)social.insertAdjacentElement('afterend',sw);else navrow.appendChild(sw);
})();