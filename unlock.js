import {unlockBytes, validateManifest} from './crypto.mjs';
const form=document.querySelector('#login-form'), status=document.querySelector('#status'), submit=document.querySelector('#submit'), password=document.querySelector('#password'), login=document.querySelector('#login');
const say=(text,kind='info')=>{status.textContent=text;status.dataset.kind=kind};
document.querySelector('#reveal').onclick=()=>{const show=password.type==='password';password.type=show?'text':'password';const button=document.querySelector('#reveal');button.textContent=show?'Скрыть':'Показать';button.setAttribute('aria-label',show?'Скрыть пароль':'Показать пароль');button.setAttribute('aria-pressed',String(show));};
form.addEventListener('submit',async event=>{
  event.preventDefault();if(submit.disabled)return;
  if(!window.isSecureContext||!globalThis.crypto?.subtle){say('Для просмотра откройте страницу по HTTPS в современном браузере.','error');return;}
  submit.disabled=true;form.setAttribute('aria-busy','true');say('Загружаем модель…');
  let phase='download', plain;
  try {
    const manifestResponse=await fetch('./manifest.json',{cache:'no-store',credentials:'omit'});
    if(!manifestResponse.ok)throw new Error('Manifest unavailable');
    const manifest=validateManifest(await manifestResponse.json());
    const response=await fetch('./'+manifest.payload,{cache:'no-store',credentials:'omit'});
    if(!response.ok)throw new Error('Model unavailable');
    const bytes=await response.arrayBuffer();phase='decrypt';say('Проверяем доступ…');
    plain=await unlockBytes(manifest,bytes,login.value,password.value);
    password.value='';phase='open';say('Открываем модель…');
    const html=new TextDecoder('utf-8',{fatal:true}).decode(plain);
    new Uint8Array(plain).fill(0);plain=null;
    // The authenticated document replaces the gate in memory. No plaintext storage or URL.
    document.open();document.write(html);document.close();
  } catch(error) {
    if(plain)new Uint8Array(plain).fill(0);
    if(phase==='decrypt'){password.value='';say('Неверный логин или пароль. Проверьте данные и попробуйте ещё раз.','error');password.focus();}
    else if(phase==='download')say('Не удалось загрузить модель. Проверьте соединение и повторите попытку.','error');
    else say('Не удалось открыть модель. Обновите страницу и попробуйте ещё раз.','error');
    submit.disabled=false;form.removeAttribute('aria-busy');
  }
});
// Avoid retaining a decrypted view in back/forward cache. Reloading always returns to the gate.
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload()});
