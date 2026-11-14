/* Reuse the team's OPUS v2 scorer as an illustrative, executable model.
   Stage labels intentionally do not present its unvalidated probability as a clinical forecast. */
(() => {
 const G=window.AlohaGolden,D=window.AlohaDay;
 const ids=['C-01','C-02','C-03','C-04','C-05','C-08'];
 const devices=ids.map(id=>structuredClone(D.DEVICES.find(d=>d.id===id)));
 const context={now:D.NOW,horizon:D.HORIZON,rate:D.EMERGENCY_RATE,confirmers:D.CONFIRMERS,robotBusy:[],blocks:[]};
 const alarmContext={...context,now:D.ALARM.at,blocks:[D.ALARM]};
 const before=G.golden(devices,context),after=G.golden(devices,alarmContext);
 if(!before.best||!after.best||before.best.id===after.best.id)throw new Error('Expected an eligible alternative after the synthetic trauma alert');
 window.CONSTELLATION={G,D,devices,context,alarmContext,before,after,ids};
})();
