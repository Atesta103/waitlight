import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";import{t as n}from"./clock-BmeYZmCq.js";import{t as r}from"./Skeleton-BHC7UmHS.js";var i=e();function a({minutes:e,className:a}){if(e===null)return(0,i.jsxs)(`div`,{className:t(`flex items-center gap-2`,a),children:[(0,i.jsx)(r,{className:`h-5 w-5 rounded-full`}),(0,i.jsx)(r,{className:`h-4 w-28`})]});let o=e<1?`Moins d'une minute`:e===1?`~1 minute`:`~${e} minutes`;return(0,i.jsxs)(`div`,{className:t(`flex items-center gap-2 text-text-secondary`,a),children:[(0,i.jsx)(n,{size:18,"aria-hidden":`true`}),(0,i.jsx)(`span`,{className:`text-sm font-medium`,children:o})]})}a.__docgenInfo={description:``,methods:[],displayName:`WaitTimeEstimate`,props:{minutes:{required:!0,tsType:{name:`union`,raw:`number | null`,elements:[{name:`number`},{name:`null`}]},description:``},className:{required:!1,tsType:{name:`string`},description:``}}};var o={title:`Composed/WaitTimeEstimate`,component:a,tags:[`autodocs`],argTypes:{minutes:{control:{type:`number`,min:-1}}}},s={args:{minutes:null}},c={args:{minutes:0}},l={args:{minutes:1}},u={args:{minutes:5}},d={args:{minutes:10}},f={render:()=>(0,i.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,i.jsx)(a,{minutes:null}),(0,i.jsx)(a,{minutes:0}),(0,i.jsx)(a,{minutes:1}),(0,i.jsx)(a,{minutes:8})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    minutes: null
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    minutes: 0
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    minutes: 1
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    minutes: 5
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    minutes: 10
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-3">
            <WaitTimeEstimate minutes={null} />
            <WaitTimeEstimate minutes={0} />
            <WaitTimeEstimate minutes={1} />
            <WaitTimeEstimate minutes={8} />
        </div>
}`,...f.parameters?.docs?.source}}};var p=[`Loading`,`LessThanOneMinute`,`OneMinute`,`FiveMinutes`,`TenMinutes`,`AllStates`];export{f as AllStates,u as FiveMinutes,c as LessThanOneMinute,s as Loading,l as OneMinute,d as TenMinutes,p as __namedExportsOrder,o as default};