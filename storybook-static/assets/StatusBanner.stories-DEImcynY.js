import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";import{t as n}from"./Card-Bze3wy0t.js";import{t as r}from"./createLucideIcon--cH2C-2t.js";import{t as i}from"./circle-alert-B2CzXhim.js";import{t as a}from"./circle-check-Dj7Qv2Fz.js";import{t as o}from"./circle-x-DygSr-0U.js";import{t as s}from"./clock-BmeYZmCq.js";import{t as c}from"./Button-BrhWPZIc.js";var l=r(`bell-ring`,[[`path`,{d:`M10.268 21a2 2 0 0 0 3.464 0`,key:`vwvbt9`}],[`path`,{d:`M22 8c0-2.3-.8-4.3-2-6`,key:`5bb3ad`}],[`path`,{d:`M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326`,key:`11g9vi`}],[`path`,{d:`M4 2C2.8 3.7 2 5.7 2 8`,key:`tap9e0`}]]),u=r(`party-popper`,[[`path`,{d:`M5.8 11.3 2 22l10.7-3.79`,key:`gwxi1d`}],[`path`,{d:`M4 3h.01`,key:`1vcuye`}],[`path`,{d:`M22 8h.01`,key:`1mrtc2`}],[`path`,{d:`M15 2h.01`,key:`1cjtqr`}],[`path`,{d:`M22 20h.01`,key:`1mrys2`}],[`path`,{d:`m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10`,key:`hbicv8`}],[`path`,{d:`m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17`,key:`1i94pl`}],[`path`,{d:`m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7`,key:`1cofks`}],[`path`,{d:`M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z`,key:`4kbmks`}]]),d=e(),f={called:{icon:u,className:`border-status-called bg-status-called-bg text-status-called`},next:{icon:l,className:`border-brand-primary bg-brand-primary/10 text-brand-primary`},done:{icon:a,className:`border-status-done bg-status-done-bg text-status-done`},closed:{icon:s,className:`border-status-waiting bg-status-waiting-bg text-status-waiting`},full:{icon:i,className:`border-feedback-warning bg-feedback-warning-bg text-feedback-warning`},error:{icon:o,className:`border-feedback-error bg-feedback-error-bg text-feedback-error`}};function p({variant:e,title:r,description:i,children:a,className:o}){let s=f[e],c=s.icon;return(0,d.jsxs)(n,{className:t(`flex flex-col items-center gap-3 border-2 py-8 text-center`,s.className,o),children:[(0,d.jsx)(c,{size:40,"aria-hidden":`true`}),(0,d.jsx)(`h2`,{className:`text-xl font-bold`,children:r}),i?(0,d.jsx)(`p`,{className:`max-w-sm text-sm opacity-80`,children:i}):null,a]})}p.__docgenInfo={description:``,methods:[],displayName:`StatusBanner`,props:{variant:{required:!0,tsType:{name:`union`,raw:`"called" | "done" | "closed" | "full" | "error" | "next"`,elements:[{name:`literal`,value:`"called"`},{name:`literal`,value:`"done"`},{name:`literal`,value:`"closed"`},{name:`literal`,value:`"full"`},{name:`literal`,value:`"error"`},{name:`literal`,value:`"next"`}]},description:``},title:{required:!0,tsType:{name:`string`},description:``},description:{required:!1,tsType:{name:`string`},description:``},children:{required:!1,tsType:{name:`ReactNode`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}};var m={title:`Composed/StatusBanner`,component:p,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`called`,`done`,`closed`,`full`,`error`,`next`]}}},h={args:{variant:`called`,title:`C'est votre tour ! 🎉`,description:`Rendez-vous au comptoir pour récupérer votre commande.`}},g={args:{variant:`next`,title:`Vous êtes presque là !`,description:`Préparez-vous, c'est bientôt votre tour.`}},_={args:{variant:`done`,title:`Commande terminée`,description:`Merci pour votre visite. À bientôt !`}},v={args:{variant:`closed`,title:`File fermée`,description:`Cet établissement n'accepte plus de clients pour le moment.`}},y={args:{variant:`full`,title:`File complète`,description:`La file d'attente est pleine. Réessayez dans quelques instants.`}},b={args:{variant:`error`,title:`Une erreur est survenue`,description:`Impossible de récupérer votre position. Réessayez.`}},x={render:()=>(0,d.jsx)(p,{variant:`called`,title:`C'est votre tour ! 🎉`,description:`Rendez-vous au comptoir.`,children:(0,d.jsx)(c,{variant:`primary`,children:`J'arrive !`})})};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "called",
    title: "C'est votre tour ! 🎉",
    description: "Rendez-vous au comptoir pour récupérer votre commande."
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "next",
    title: "Vous êtes presque là !",
    description: "Préparez-vous, c'est bientôt votre tour."
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "done",
    title: "Commande terminée",
    description: "Merci pour votre visite. À bientôt !"
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "closed",
    title: "File fermée",
    description: "Cet établissement n'accepte plus de clients pour le moment."
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "full",
    title: "File complète",
    description: "La file d'attente est pleine. Réessayez dans quelques instants."
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "error",
    title: "Une erreur est survenue",
    description: "Impossible de récupérer votre position. Réessayez."
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <StatusBanner variant="called" title="C'est votre tour ! 🎉" description="Rendez-vous au comptoir.">
            <Button variant="primary">J'arrive !</Button>
        </StatusBanner>
}`,...x.parameters?.docs?.source}}};var S=[`Called`,`Next`,`Done`,`Closed`,`Full`,`Error`,`WithAction`];export{h as Called,v as Closed,_ as Done,b as Error,y as Full,g as Next,x as WithAction,S as __namedExportsOrder,m as default};