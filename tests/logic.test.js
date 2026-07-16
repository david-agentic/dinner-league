// Money-math regression tests. Run: node tests/logic.test.js
// Mirrors balances()/realBalances() in public/index.html — keep in sync.
const PEOPLE=[{id:'daood',canPay:true},{id:'mudassir',canPay:true},{id:'talha',canPay:true},{id:'khan',canPay:true},{id:'saad',canPay:false}];
const p=id=>PEOPLE.find(x=>x.id===id);
let MEALS=[],SETTLES=[];
const monthKey=d=>d.slice(0,7);
function balances(month){const b={};PEOPLE.forEach(x=>b[x.id]=0);
  MEALS.forEach(m=>{if(month&&monthKey(m.date)!==month)return;
    const payers=m.att.filter(id=>p(id)&&p(id).canPay);if(!payers.length)return;
    const share=m.total/payers.length;payers.forEach(id=>b[id]-=share);b[m.payer]+=m.total;});return b;}
function realBalances(){const b=balances(null);
  SETTLES.forEach(st=>{if(b[st.from]!==undefined)b[st.from]+=st.amount;if(b[st.to]!==undefined)b[st.to]-=st.amount;});return b;}
let fails=0;
const t=(name,ok)=>{console.log(ok?'PASS':'FAIL',name);if(!ok)fails++;};
MEALS=[{date:'2026-07-15',total:1200,att:['daood','mudassir','talha','saad'],payer:'daood'}];
let b=balances('2026-07');
t('saad rule: bill/3, saad zero', b.daood===800&&b.mudassir===-400&&b.talha===-400&&b.saad===0);
SETTLES=[{from:'talha',to:'daood',amount:400}];
b=realBalances();
t('settlement direction', b.daood===400&&b.talha===0);
MEALS.push({date:'2026-08-02',total:900,att:['talha','khan','saad'],payer:'khan'});
const aug=balances('2026-08');
t('season isolation', aug.daood===0&&aug.khan===450&&aug.talha===-450);
t('conservation of money', Math.abs(Object.values(realBalances()).reduce((a,x)=>a+x,0))<1e-9);
MEALS=[{date:'2026-07-20',total:500,att:['khan','saad'],payer:'khan'}];SETTLES=[];
b=balances('2026-07');
t('solo payer covers guest', b.khan===0&&b.saad===0);
process.exit(fails?1:0);
