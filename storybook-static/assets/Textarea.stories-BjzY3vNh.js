import{l as e}from"./iframe-CoC_EONl.js";import{t}from"./react-Ba-NYFKF.js";import{t as n}from"./jsx-runtime-DqwUiDpP.js";import{t as r}from"./cn-BbnZYjoy.js";var i=e(t()),a=n(),o=(0,i.forwardRef)(({label:e,error:t,hint:n,className:o,id:s,...c},l)=>{let u=(0,i.useId)(),d=s??u,f=n?`${d}-hint`:void 0,p=t?`${d}-error`:void 0,m=[f,p].filter(Boolean).join(` `)||void 0;return(0,a.jsxs)(`div`,{className:`flex flex-col gap-1.5`,children:[(0,a.jsx)(`label`,{htmlFor:d,className:`text-sm font-medium text-text-primary`,children:e}),(0,a.jsx)(`textarea`,{ref:l,id:d,"aria-describedby":m,"aria-invalid":t?!0:void 0,className:r(`min-h-24 rounded-md border px-3 py-2 text-base transition-colors`,`bg-surface-card text-text-primary placeholder:text-text-disabled`,`focus:border-border-focus focus:ring-2 focus:ring-border-focus/25 focus:outline-none`,t?`border-feedback-error`:`border-border-default`,o),...c}),n&&!t?(0,a.jsx)(`p`,{id:f,className:`text-sm text-text-secondary`,children:n}):null,t?(0,a.jsx)(`p`,{id:p,className:`text-sm text-feedback-error`,role:`alert`,children:t}):null]})});o.displayName=`Textarea`,o.__docgenInfo={description:``,methods:[],displayName:`Textarea`,props:{label:{required:!0,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``},hint:{required:!1,tsType:{name:`string`},description:``}}};var s={title:`UI/Textarea`,component:o,tags:[`autodocs`],argTypes:{disabled:{control:`boolean`}}},c={args:{label:`Message d'accueil`,placeholder:`Bienvenue ! Votre commande sera prête dans quelques minutes…`}},l={args:{label:`Message d'accueil`,placeholder:`Bienvenue…`,hint:`Affiché sur la page d'attente du client. Max 500 caractères.`}},u={args:{label:`Message d'accueil`,defaultValue:`x`,error:`Le message doit contenir au moins 10 caractères.`}},d={args:{label:`Message d'accueil`,defaultValue:`Bienvenue dans notre établissement.`,disabled:!0}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Message d'accueil",
    placeholder: "Bienvenue ! Votre commande sera prête dans quelques minutes…"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Message d'accueil",
    placeholder: "Bienvenue…",
    hint: "Affiché sur la page d'attente du client. Max 500 caractères."
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Message d'accueil",
    defaultValue: "x",
    error: "Le message doit contenir au moins 10 caractères."
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Message d'accueil",
    defaultValue: "Bienvenue dans notre établissement.",
    disabled: true
  }
}`,...d.parameters?.docs?.source}}};var f=[`Default`,`WithHint`,`WithError`,`Disabled`];export{c as Default,d as Disabled,u as WithError,l as WithHint,f as __namedExportsOrder,s as default};