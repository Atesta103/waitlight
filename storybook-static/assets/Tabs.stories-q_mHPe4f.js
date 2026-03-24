import{l as e}from"./iframe-CoC_EONl.js";import{t}from"./react-Ba-NYFKF.js";import{t as n}from"./jsx-runtime-DqwUiDpP.js";import{t as r}from"./cn-BbnZYjoy.js";import{t as i}from"./createLucideIcon--cH2C-2t.js";import{t as a}from"./users-DIKGVb1g.js";var o=i(`chart-no-axes-column-increasing`,[[`path`,{d:`M5 21v-6`,key:`1hz6c0`}],[`path`,{d:`M12 21V9`,key:`uvy0l4`}],[`path`,{d:`M19 21V3`,key:`11j9sm`}]]),s=i(`settings`,[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`,key:`1i5ecw`}],[`circle`,{cx:`12`,cy:`12`,r:`3`,key:`1v7zrd`}]]),c=e(t()),l=n();function u({tabs:e,defaultValue:t,value:n,onChange:i,className:a}){let[o,s]=(0,c.useState)(t??e[0]?.value??``),u=n??o,d=e=>{n||s(e),i?.(e)};return(0,l.jsx)(`div`,{role:`tablist`,className:r(`flex gap-1 rounded-lg border border-border-default bg-surface-base p-1`,a),children:e.map(e=>{let t=u===e.value;return(0,l.jsxs)(`button`,{role:`tab`,type:`button`,"aria-selected":t,onClick:()=>d(e.value),className:r(`inline-flex min-h-9 min-w-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors`,`focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none`,t?`bg-surface-card text-text-primary shadow-sm`:`text-text-secondary hover:text-text-primary`),children:[e.icon?(0,l.jsx)(`span`,{"aria-hidden":`true`,children:e.icon}):null,e.label]},e.value)})})}u.__docgenInfo={description:``,methods:[],displayName:`Tabs`,props:{tabs:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
    value: string
    label: string
    icon?: React.ReactNode
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`icon`,value:{name:`ReactReactNode`,raw:`React.ReactNode`,required:!1}}]}}],raw:`TabItem[]`},description:``},defaultValue:{required:!1,tsType:{name:`string`},description:``},value:{required:!1,tsType:{name:`string`},description:``},onChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:``},className:{required:!1,tsType:{name:`string`},description:``}}};var d={title:`UI/Tabs`,component:u,tags:[`autodocs`]},f={args:{tabs:[{value:`queue`,label:`File d'attente`},{value:`analytics`,label:`Analytique`}],defaultValue:`queue`}},p={args:{tabs:[{value:`clients`,label:`Clients`},{value:`payments`,label:`Paiements`},{value:`invoices`,label:`Factures`}],defaultValue:`clients`}},m={render:()=>(0,l.jsx)(u,{tabs:[{value:`queue`,label:`File`,icon:(0,l.jsx)(a,{size:14})},{value:`analytics`,label:`Stats`,icon:(0,l.jsx)(o,{size:14})},{value:`settings`,label:`Réglages`,icon:(0,l.jsx)(s,{size:14})}],defaultValue:`queue`})};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: [{
      value: "queue",
      label: "File d'attente"
    }, {
      value: "analytics",
      label: "Analytique"
    }],
    defaultValue: "queue"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: [{
      value: "clients",
      label: "Clients"
    }, {
      value: "payments",
      label: "Paiements"
    }, {
      value: "invoices",
      label: "Factures"
    }],
    defaultValue: "clients"
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs tabs={[{
    value: "queue",
    label: "File",
    icon: <Users size={14} />
  }, {
    value: "analytics",
    label: "Stats",
    icon: <BarChart size={14} />
  }, {
    value: "settings",
    label: "Réglages",
    icon: <Settings size={14} />
  }]} defaultValue="queue" />
}`,...m.parameters?.docs?.source}}};var h=[`TwoTabs`,`ThreeTabs`,`WithIcons`];export{p as ThreeTabs,f as TwoTabs,m as WithIcons,h as __namedExportsOrder,d as default};