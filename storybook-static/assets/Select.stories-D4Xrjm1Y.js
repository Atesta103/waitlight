import{l as e}from"./iframe-CoC_EONl.js";import{t}from"./react-Ba-NYFKF.js";import{t as n}from"./jsx-runtime-DqwUiDpP.js";import{t as r}from"./cn-BbnZYjoy.js";import{t as i}from"./createLucideIcon--cH2C-2t.js";var a=i(`chevron-down`,[[`path`,{d:`m6 9 6 6 6-6`,key:`qrunsl`}]]),o=e(t()),s=n(),c=(0,o.forwardRef)(({label:e,error:t,hint:n,options:i,placeholder:c,className:l,id:u,...d},f)=>{let p=(0,o.useId)(),m=u??p,h=n?`${m}-hint`:void 0,g=t?`${m}-error`:void 0,_=[h,g].filter(Boolean).join(` `)||void 0;return(0,s.jsxs)(`div`,{className:`flex flex-col gap-1.5`,children:[(0,s.jsx)(`label`,{htmlFor:m,className:`text-sm font-medium text-text-primary`,children:e}),(0,s.jsxs)(`div`,{className:`relative`,children:[(0,s.jsxs)(`select`,{ref:f,id:m,"aria-describedby":_,"aria-invalid":t?!0:void 0,className:r(`h-11 w-full cursor-pointer appearance-none rounded-md border bg-surface-card px-3 pr-10 text-base transition-colors`,`text-text-primary`,`focus:border-border-focus focus:ring-2 focus:ring-border-focus/25 focus:outline-none`,t?`border-feedback-error`:`border-border-default`,l),...d,children:[c?(0,s.jsx)(`option`,{value:``,disabled:!0,children:c}):null,i.map(e=>(0,s.jsx)(`option`,{value:e.value,children:e.label},e.value))]}),(0,s.jsx)(a,{size:18,className:`pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary`,"aria-hidden":`true`})]}),n&&!t?(0,s.jsx)(`p`,{id:h,className:`text-sm text-text-secondary`,children:n}):null,t?(0,s.jsx)(`p`,{id:g,className:`text-sm text-feedback-error`,role:`alert`,children:t}):null]})});c.displayName=`Select`,c.__docgenInfo={description:``,methods:[],displayName:`Select`,props:{label:{required:!0,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``},hint:{required:!1,tsType:{name:`string`},description:``},options:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ value: string; label: string }`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}}]}}],raw:`{ value: string; label: string }[]`},description:``},placeholder:{required:!1,tsType:{name:`string`},description:``}}};var l=[{value:`3`,label:`3 minutes`},{value:`5`,label:`5 minutes`},{value:`10`,label:`10 minutes`},{value:`15`,label:`15 minutes`}],u={title:`UI/Select`,component:c,tags:[`autodocs`],argTypes:{disabled:{control:`boolean`}}},d={args:{label:`Temps de préparation`,options:l,placeholder:`Choisir…`}},f={args:{label:`Temps de préparation`,options:l,hint:`Utilisé pour estimer l'attente des clients.`,defaultValue:`5`}},p={args:{label:`Temps de préparation`,options:l,error:`Ce champ est obligatoire.`}},m={args:{label:`Temps de préparation`,options:l,defaultValue:`5`,disabled:!0}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Temps de préparation",
    options: PREP_OPTIONS,
    placeholder: "Choisir…"
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Temps de préparation",
    options: PREP_OPTIONS,
    hint: "Utilisé pour estimer l'attente des clients.",
    defaultValue: "5"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Temps de préparation",
    options: PREP_OPTIONS,
    error: "Ce champ est obligatoire."
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Temps de préparation",
    options: PREP_OPTIONS,
    defaultValue: "5",
    disabled: true
  }
}`,...m.parameters?.docs?.source}}};var h=[`Default`,`WithHint`,`WithError`,`Disabled`];export{d as Default,m as Disabled,p as WithError,f as WithHint,h as __namedExportsOrder,u as default};