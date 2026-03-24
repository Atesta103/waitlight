import{l as e}from"./iframe-CoC_EONl.js";import{t}from"./react-Ba-NYFKF.js";import{t as n}from"./jsx-runtime-DqwUiDpP.js";import{t as r}from"./cn-BbnZYjoy.js";var i=e(t()),a=n(),o=(0,i.forwardRef)(({label:e,error:t,hint:n,className:o,id:s,...c},l)=>{let u=(0,i.useId)(),d=s??u,f=n?`${d}-hint`:void 0,p=t?`${d}-error`:void 0,m=[f,p].filter(Boolean).join(` `)||void 0;return(0,a.jsxs)(`div`,{className:`flex flex-col gap-1.5`,children:[(0,a.jsx)(`label`,{htmlFor:d,className:`text-sm font-medium text-text-primary`,children:e}),(0,a.jsx)(`input`,{ref:l,id:d,"aria-describedby":m,"aria-invalid":t?!0:void 0,className:r(`h-11 min-w-0 rounded-md border px-3 text-base transition-colors`,`bg-surface-card text-text-primary placeholder:text-text-disabled`,`focus:border-border-focus focus:ring-2 focus:ring-border-focus/25 focus:outline-none`,t?`border-feedback-error`:`border-border-default`,o),...c}),n&&!t?(0,a.jsx)(`p`,{id:f,className:`text-sm text-text-secondary`,children:n}):null,t?(0,a.jsx)(`p`,{id:p,className:`text-sm text-feedback-error`,role:`alert`,children:t}):null]})});o.displayName=`Input`,o.__docgenInfo={description:``,methods:[],displayName:`Input`,props:{label:{required:!0,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``},hint:{required:!1,tsType:{name:`string`},description:``}}};var s={title:`UI/Input`,component:o,tags:[`autodocs`],argTypes:{disabled:{control:`boolean`}}},c={args:{label:`Nom du client`,placeholder:`Marie Dupond`}},l={args:{label:`Email`,placeholder:`vous@exemple.fr`,hint:`Utilisé uniquement pour la confirmation.`,type:`email`}},u={args:{label:`Nom du client`,placeholder:`Marie Dupond`,error:`Ce champ est obligatoire.`,defaultValue:``}},d={args:{label:`Slug`,defaultValue:`boulangerie-martin`,disabled:!0}},f={args:{label:`Mot de passe`,placeholder:`••••••••`,type:`password`}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Nom du client",
    placeholder: "Marie Dupond"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Email",
    placeholder: "vous@exemple.fr",
    hint: "Utilisé uniquement pour la confirmation.",
    type: "email"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Nom du client",
    placeholder: "Marie Dupond",
    error: "Ce champ est obligatoire.",
    defaultValue: ""
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Slug",
    defaultValue: "boulangerie-martin",
    disabled: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Mot de passe",
    placeholder: "••••••••",
    type: "password"
  }
}`,...f.parameters?.docs?.source}}};var p=[`Default`,`WithHint`,`WithError`,`Disabled`,`Password`];export{c as Default,d as Disabled,f as Password,u as WithError,l as WithHint,p as __namedExportsOrder,s as default};