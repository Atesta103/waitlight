import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";import{t as n}from"./circle-check-Dj7Qv2Fz.js";import{t as r}from"./circle-x-DygSr-0U.js";import{t as i}from"./clock-BmeYZmCq.js";import{t as a}from"./phone-call-y2rdOOkL.js";var o=e(),s={waiting:{label:`En attente`,className:`bg-status-waiting-bg text-status-waiting`,icon:i},called:{label:`Appelé`,className:`bg-status-called-bg text-status-called`,icon:a},done:{label:`Terminé`,className:`bg-status-done-bg text-status-done`,icon:n},cancelled:{label:`Annulé`,className:`bg-status-cancelled-bg text-status-cancelled`,icon:r}};function c({status:e,showIcon:n=!0,className:r,children:i}){let a=s[e],c=a.icon;return(0,o.jsxs)(`span`,{className:t(`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium`,a.className,r),children:[n?(0,o.jsx)(c,{size:14,"aria-hidden":`true`}):null,i??a.label]})}c.__docgenInfo={description:``,methods:[],displayName:`Badge`,props:{status:{required:!0,tsType:{name:`union`,raw:`keyof typeof statusConfig`,elements:[{name:`literal`,value:`waiting`},{name:`literal`,value:`called`},{name:`literal`,value:`done`},{name:`literal`,value:`cancelled`}]},description:``},showIcon:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`true`,computed:!1}},className:{required:!1,tsType:{name:`string`},description:``},children:{required:!1,tsType:{name:`ReactNode`},description:``}}};var l={title:`UI/Badge`,component:c,tags:[`autodocs`],argTypes:{status:{control:`select`,options:[`waiting`,`called`,`done`,`cancelled`]},showIcon:{control:`boolean`}}},u={args:{status:`waiting`,showIcon:!0}},d={args:{status:`called`,showIcon:!0}},f={args:{status:`done`,showIcon:!0}},p={args:{status:`cancelled`,showIcon:!0}},m={args:{status:`waiting`,showIcon:!1}},h={args:{status:`called`,showIcon:!0,children:`Votre tour !`}},g={render:()=>(0,o.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,o.jsx)(c,{status:`waiting`}),(0,o.jsx)(c,{status:`called`}),(0,o.jsx)(c,{status:`done`}),(0,o.jsx)(c,{status:`cancelled`})]})};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    status: "waiting",
    showIcon: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    status: "called",
    showIcon: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    status: "done",
    showIcon: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    status: "cancelled",
    showIcon: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    status: "waiting",
    showIcon: false
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    status: "called",
    showIcon: true,
    children: "Votre tour !"
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-2">
            <Badge status="waiting" />
            <Badge status="called" />
            <Badge status="done" />
            <Badge status="cancelled" />
        </div>
}`,...g.parameters?.docs?.source}}};var _=[`Waiting`,`Called`,`Done`,`Cancelled`,`WithoutIcon`,`CustomLabel`,`AllStatuses`];export{g as AllStatuses,d as Called,p as Cancelled,h as CustomLabel,f as Done,u as Waiting,m as WithoutIcon,_ as __namedExportsOrder,l as default};