import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";import{t as n}from"./createLucideIcon--cH2C-2t.js";import{t as r}from"./loader-circle-Cnfgvmq5.js";var i=n(`wifi-off`,[[`path`,{d:`M12 20h.01`,key:`zekei9`}],[`path`,{d:`M8.5 16.429a5 5 0 0 1 7 0`,key:`1bycff`}],[`path`,{d:`M5 12.859a10 10 0 0 1 5.17-2.69`,key:`1dl1wf`}],[`path`,{d:`M19 12.859a10 10 0 0 0-2.007-1.523`,key:`4k23kn`}],[`path`,{d:`M2 8.82a15 15 0 0 1 4.177-2.643`,key:`1grhjp`}],[`path`,{d:`M22 8.82a15 15 0 0 0-11.288-3.764`,key:`z3jwby`}],[`path`,{d:`m2 2 20 20`,key:`1ooewy`}]]),a=n(`wifi`,[[`path`,{d:`M12 20h.01`,key:`zekei9`}],[`path`,{d:`M2 8.82a15 15 0 0 1 20 0`,key:`dnpr2z`}],[`path`,{d:`M5 12.859a10 10 0 0 1 14 0`,key:`1x1e6c`}],[`path`,{d:`M8.5 16.429a5 5 0 0 1 7 0`,key:`1bycff`}]]),o=e(),s={connected:{label:`Connecté`,className:`bg-feedback-success-bg text-feedback-success`,icon:a},reconnecting:{label:`Reconnexion en cours…`,className:`bg-feedback-warning-bg text-feedback-warning`,icon:r},offline:{label:`Connexion perdue`,className:`bg-feedback-error-bg text-feedback-error`,icon:i}};function c({state:e,className:n}){let r=s[e],i=r.icon;return(0,o.jsxs)(`div`,{role:`status`,"aria-live":`polite`,className:t(`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium`,r.className,n),children:[(0,o.jsx)(i,{size:16,className:t(e===`reconnecting`&&`animate-spin`),"aria-hidden":`true`}),r.label]})}c.__docgenInfo={description:``,methods:[],displayName:`ConnectionStatus`,props:{state:{required:!0,tsType:{name:`union`,raw:`"connected" | "reconnecting" | "offline"`,elements:[{name:`literal`,value:`"connected"`},{name:`literal`,value:`"reconnecting"`},{name:`literal`,value:`"offline"`}]},description:``},className:{required:!1,tsType:{name:`string`},description:``}}};var l={title:`Composed/ConnectionStatus`,component:c,tags:[`autodocs`],argTypes:{state:{control:`select`,options:[`connected`,`reconnecting`,`offline`]}}},u={args:{state:`connected`}},d={args:{state:`reconnecting`}},f={args:{state:`offline`}},p={render:()=>(0,o.jsxs)(`div`,{className:`flex flex-col gap-2 w-72`,children:[(0,o.jsx)(c,{state:`connected`}),(0,o.jsx)(c,{state:`reconnecting`}),(0,o.jsx)(c,{state:`offline`})]})};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    state: "connected"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    state: "reconnecting"
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    state: "offline"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2 w-72">
            <ConnectionStatus state="connected" />
            <ConnectionStatus state="reconnecting" />
            <ConnectionStatus state="offline" />
        </div>
}`,...p.parameters?.docs?.source}}};var m=[`Connected`,`Reconnecting`,`Offline`,`AllStates`];export{p as AllStates,u as Connected,f as Offline,d as Reconnecting,m as __namedExportsOrder,l as default};