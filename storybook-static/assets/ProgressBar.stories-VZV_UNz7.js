import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./ProgressBar-BI3GKcIV.js";var n=e(),r={title:`UI/ProgressBar`,component:t,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`default`,`success`,`warning`,`error`]},size:{control:`select`,options:[`sm`,`md`,`lg`]},value:{control:{type:`range`,min:0,max:100}},showValue:{control:`boolean`}}},i={args:{value:60,label:`Progression`}},a={args:{value:0,label:`Vide`}},o={args:{value:100,label:`Complet`,variant:`success`}},s={args:{value:75,label:`Presque plein`,variant:`warning`,showValue:!0}},c={args:{value:92,label:`File saturée`,variant:`error`,showValue:!0}},l={args:{value:50,size:`sm`}},u={args:{value:50,size:`lg`,label:`Grande barre`,showValue:!0}},d={render:()=>(0,n.jsxs)(`div`,{className:`flex w-72 flex-col gap-4`,children:[(0,n.jsx)(t,{value:60,label:`Default`,variant:`default`}),(0,n.jsx)(t,{value:85,label:`Success`,variant:`success`}),(0,n.jsx)(t,{value:70,label:`Warning`,variant:`warning`}),(0,n.jsx)(t,{value:92,label:`Error`,variant:`error`})]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: "Progression"
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: "Vide"
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: "Complet",
    variant: "success"
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: "Presque plein",
    variant: "warning",
    showValue: true
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 92,
    label: "File saturée",
    variant: "error",
    showValue: true
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 50,
    size: "sm"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: 50,
    size: "lg",
    label: "Grande barre",
    showValue: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-72 flex-col gap-4">
            <ProgressBar value={60} label="Default" variant="default" />
            <ProgressBar value={85} label="Success" variant="success" />
            <ProgressBar value={70} label="Warning" variant="warning" />
            <ProgressBar value={92} label="Error" variant="error" />
        </div>
}`,...d.parameters?.docs?.source}}};var f=[`Default`,`Empty`,`Full`,`Warning`,`Error`,`Small`,`Large`,`AllVariants`];export{d as AllVariants,i as Default,a as Empty,c as Error,o as Full,u as Large,l as Small,s as Warning,f as __namedExportsOrder,r as default};