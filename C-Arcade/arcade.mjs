const dialog=document.querySelector('#share-dialog');
const arcadeURL=new URL('./',location.href).href.split('#')[0].split('?')[0];
document.querySelector('#open-share').addEventListener('click',()=>dialog.showModal());
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
dialog.querySelector('.copy').addEventListener('click',async()=>{
 const status=document.querySelector('#share-status');
 try{
  await navigator.clipboard.writeText(arcadeURL);
  status.textContent='Copied. Challenge someone.';
 }catch{
  status.textContent=arcadeURL;
 }
});
