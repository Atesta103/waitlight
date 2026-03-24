import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";import{t as n}from"./Card-Bze3wy0t.js";import{t as r}from"./circle-check-Dj7Qv2Fz.js";import{n as i,t as a}from"./Dropdown-CiBOTSL1.js";import{t as o}from"./phone-call-y2rdOOkL.js";import{t as s}from"./x-DO2zZrh_.js";import{t as c}from"./Button-BrhWPZIc.js";import{t as l}from"./Avatar-D2QwjyaC.js";var u=e();function d({id:e,customerName:d,status:f,position:p,joinedAt:m,onCall:h,onComplete:g,onCancel:_,className:v}){let y=new Intl.DateTimeFormat(`fr-FR`,{hour:`2-digit`,minute:`2-digit`}).format(new Date(m));return(0,u.jsxs)(n,{as:`article`,className:t(`relative flex items-center justify-between gap-4 p-3 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`,f===`called`&&`border-status-called/30 bg-status-called-bg ring-1 ring-inset ring-status-called/50 shadow-sm`,v),children:[(0,u.jsxs)(`div`,{className:`flex min-w-0 flex-1 items-center gap-3 sm:gap-4`,children:[p==null?(0,u.jsx)(l,{name:d,size:`md`}):(0,u.jsxs)(`div`,{className:t(`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-surface-base text-base sm:text-lg font-bold shadow-sm border border-border-default`,f===`called`?`border-status-called/30 text-status-called`:`text-text-primary`),children:[`#`,p]}),(0,u.jsxs)(`div`,{className:`flex min-w-0 flex-col`,children:[(0,u.jsx)(`p`,{className:`truncate text-base font-semibold text-text-primary`,children:d}),(0,u.jsxs)(`p`,{className:`mt-0.5 text-xs sm:text-sm font-medium text-text-secondary`,children:[f===`waiting`?`Attente depuis `:`Appelé à `,(0,u.jsx)(`span`,{className:`font-semibold text-text-primary`,children:y})]})]})]}),(0,u.jsxs)(`div`,{className:`flex shrink-0 items-center gap-1 sm:gap-2`,children:[f===`waiting`&&h&&(0,u.jsxs)(c,{variant:`primary`,size:`md`,onClick:()=>h(e),"aria-label":`Appeler ${d}`,className:`flex h-10 w-10 items-center justify-center rounded-full px-0 sm:w-auto sm:rounded-md sm:px-4`,children:[(0,u.jsx)(o,{size:18,"aria-hidden":`true`}),(0,u.jsx)(`span`,{className:`hidden sm:inline`,children:`Appeler`})]}),f===`called`&&g&&(0,u.jsxs)(c,{variant:`primary`,size:`md`,onClick:()=>g(e),"aria-label":`Terminer le ticket de ${d}`,className:`flex h-10 w-10 items-center justify-center rounded-full bg-status-called px-0 text-white hover:bg-status-called/90 sm:w-auto sm:rounded-md sm:px-4`,style:{color:`white`},children:[(0,u.jsx)(r,{size:18,"aria-hidden":`true`}),(0,u.jsx)(`span`,{className:`hidden sm:inline`,children:`Terminer`})]}),_&&(f===`waiting`||f===`called`)&&(0,u.jsx)(a,{align:`right`,trigger:(0,u.jsx)(c,{variant:`ghost`,size:`md`,className:`flex h-10 w-10 items-center justify-center px-0 text-text-secondary hover:text-text-primary`,"aria-label":`Plus d'options`,children:(0,u.jsx)(i,{size:18})}),items:[{label:`Annuler le ticket`,icon:(0,u.jsx)(s,{size:16}),variant:`destructive`,onClick:()=>_(e)}]})]})]})}d.__docgenInfo={description:``,methods:[],displayName:`TicketCard`,props:{id:{required:!0,tsType:{name:`string`},description:``},customerName:{required:!0,tsType:{name:`string`},description:``},status:{required:!0,tsType:{name:`union`,raw:`"waiting" | "called" | "done" | "cancelled"`,elements:[{name:`literal`,value:`"waiting"`},{name:`literal`,value:`"called"`},{name:`literal`,value:`"done"`},{name:`literal`,value:`"cancelled"`}]},description:``},position:{required:!1,tsType:{name:`number`},description:``},joinedAt:{required:!0,tsType:{name:`string`},description:``},onCall:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: string) => void`,signature:{arguments:[{type:{name:`string`},name:`id`}],return:{name:`void`}}},description:``},onComplete:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: string) => void`,signature:{arguments:[{type:{name:`string`},name:`id`}],return:{name:`void`}}},description:``},onCancel:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: string) => void`,signature:{arguments:[{type:{name:`string`},name:`id`}],return:{name:`void`}}},description:``},className:{required:!1,tsType:{name:`string`},description:``}}};var f=new Date(Date.now()-720*1e3).toISOString(),p=new Date(Date.now()-120*1e3).toISOString(),m={title:`Composed/TicketCard`,component:d,tags:[`autodocs`],parameters:{layout:`padded`}},h={args:{id:`ticket-1`,customerName:`Marie Dupond`,status:`waiting`,position:1,joinedAt:f,onCall:e=>alert(`Call ${e}`),onCancel:e=>alert(`Cancel ${e}`)}},g={args:{id:`ticket-2`,customerName:`Lucas Martin`,status:`called`,position:2,joinedAt:p,onComplete:e=>alert(`Complete ${e}`),onCancel:e=>alert(`Cancel ${e}`)}},_={args:{id:`ticket-3`,customerName:`Pierre Bernard`,status:`done`,joinedAt:f}},v={args:{id:`ticket-4`,customerName:`Diana Petit`,status:`cancelled`,joinedAt:f}},y={args:{id:`ticket-5`,customerName:`Alice Simon`,status:`waiting`,joinedAt:f,onCall:()=>{},onCancel:()=>{}}},b={render:()=>(0,u.jsxs)(`div`,{className:`flex w-full max-w-xl flex-col gap-3`,children:[(0,u.jsx)(d,{id:`1`,customerName:`Marie Dupond`,status:`called`,position:1,joinedAt:new Date(Date.now()-180*1e3).toISOString(),onComplete:()=>{},onCancel:()=>{}}),(0,u.jsx)(d,{id:`2`,customerName:`Lucas Martin`,status:`waiting`,position:2,joinedAt:new Date(Date.now()-600*1e3).toISOString(),onCall:()=>{},onCancel:()=>{}}),(0,u.jsx)(d,{id:`3`,customerName:`Pierre Bernard`,status:`waiting`,position:3,joinedAt:new Date(Date.now()-900*1e3).toISOString(),onCall:()=>{},onCancel:()=>{}})]})};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    id: "ticket-1",
    customerName: "Marie Dupond",
    status: "waiting",
    position: 1,
    joinedAt: JOINED_AT,
    onCall: id => alert(\`Call \${id}\`),
    onCancel: id => alert(\`Cancel \${id}\`)
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    id: "ticket-2",
    customerName: "Lucas Martin",
    status: "called",
    position: 2,
    joinedAt: CALLED_AT,
    onComplete: id => alert(\`Complete \${id}\`),
    onCancel: id => alert(\`Cancel \${id}\`)
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    id: "ticket-3",
    customerName: "Pierre Bernard",
    status: "done",
    joinedAt: JOINED_AT
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    id: "ticket-4",
    customerName: "Diana Petit",
    status: "cancelled",
    joinedAt: JOINED_AT
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    id: "ticket-5",
    customerName: "Alice Simon",
    status: "waiting",
    joinedAt: JOINED_AT,
    onCall: () => {},
    onCancel: () => {}
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-full max-w-xl flex-col gap-3">
            <TicketCard id="1" customerName="Marie Dupond" status="called" position={1} joinedAt={new Date(Date.now() - 3 * 60 * 1000).toISOString()} onComplete={() => {}} onCancel={() => {}} />
            <TicketCard id="2" customerName="Lucas Martin" status="waiting" position={2} joinedAt={new Date(Date.now() - 10 * 60 * 1000).toISOString()} onCall={() => {}} onCancel={() => {}} />
            <TicketCard id="3" customerName="Pierre Bernard" status="waiting" position={3} joinedAt={new Date(Date.now() - 15 * 60 * 1000).toISOString()} onCall={() => {}} onCancel={() => {}} />
        </div>
}`,...b.parameters?.docs?.source}}};var x=[`Waiting`,`Called`,`Done`,`Cancelled`,`WithoutPosition`,`QueueList`];export{g as Called,v as Cancelled,_ as Done,b as QueueList,h as Waiting,y as WithoutPosition,x as __namedExportsOrder,m as default};