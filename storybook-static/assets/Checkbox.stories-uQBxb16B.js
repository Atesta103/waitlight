import{l as e}from"./iframe-CoC_EONl.js";import{t}from"./react-Ba-NYFKF.js";import{t as n}from"./jsx-runtime-DqwUiDpP.js";import{t as r}from"./cn-BbnZYjoy.js";import{t as i}from"./check-4LCD1aAp.js";var a=e(t()),o=n(),s=(0,a.forwardRef)(({label:e,error:t,className:n,id:s,...c},l)=>{let u=(0,a.useId)(),d=s??u,f=t?`${d}-error`:void 0;return(0,o.jsx)(`div`,{className:`flex flex-col gap-1`,children:(0,o.jsxs)(`label`,{htmlFor:d,className:r(`group flex cursor-pointer items-start gap-3 rounded-xl border border-border-default/50 bg-surface-card p-4 transition-all shadow-sm`,`hover:border-brand-primary/20 hover:bg-brand-primary/5 active:scale-[0.98]`,t&&`border-feedback-error/30 bg-feedback-error/5`,c.disabled&&`cursor-not-allowed opacity-50 hover:bg-transparent active:scale-100`,n),children:[(0,o.jsxs)(`span`,{className:`relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center`,children:[(0,o.jsx)(`input`,{ref:l,id:d,type:`checkbox`,"aria-describedby":f,"aria-invalid":t?!0:void 0,className:r(`peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 transition-all`,`focus-visible:ring-2 focus-visible:ring-border-focus/25 focus-visible:outline-none`,t?`border-feedback-error`:`border-border-default group-hover:border-brand-primary/40`,`checked:border-brand-primary checked:bg-brand-primary`),...c}),(0,o.jsx)(i,{size:12,strokeWidth:3,className:`pointer-events-none absolute hidden text-text-inverse peer-checked:block`,"aria-hidden":`true`})]}),(0,o.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,o.jsx)(`span`,{className:`text-sm leading-5 font-medium text-text-primary`,children:e}),t?(0,o.jsx)(`p`,{id:f,className:`text-xs font-semibold text-feedback-error`,role:`alert`,children:t}):null]})]})})});s.displayName=`Checkbox`,s.__docgenInfo={description:``,methods:[],displayName:`Checkbox`,props:{label:{required:!0,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``}}};var c={title:`UI/Checkbox`,component:s,tags:[`autodocs`],argTypes:{disabled:{control:`boolean`}}},l={args:{label:`Activer les notifications`,defaultChecked:!1}},u={args:{label:`Activer les notifications`,defaultChecked:!0}},d={args:{label:`Accepter les conditions d'utilisation`,error:`Vous devez accepter les conditions.`}},f={args:{label:`Option indisponible`,disabled:!0}},p={args:{label:`Option indisponible (active)`,disabled:!0,defaultChecked:!0}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Activer les notifications",
    defaultChecked: false
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Activer les notifications",
    defaultChecked: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Accepter les conditions d'utilisation",
    error: "Vous devez accepter les conditions."
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Option indisponible",
    disabled: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Option indisponible (active)",
    disabled: true,
    defaultChecked: true
  }
}`,...p.parameters?.docs?.source}}};var m=[`Unchecked`,`Checked`,`WithError`,`Disabled`,`DisabledChecked`];export{u as Checked,f as Disabled,p as DisabledChecked,l as Unchecked,d as WithError,m as __namedExportsOrder,c as default};