import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";import{n,t as r}from"./Card-Bze3wy0t.js";import{t as i}from"./ProgressBar-BI3GKcIV.js";import{t as a}from"./users-DIKGVb1g.js";var o=e();function s({current:e,max:s,className:c}){let l=s>0?e/s*100:0,u=l>=90?`error`:l>=70?`warning`:`default`,d=l>=100?`File complète`:l>=90?`Presque plein`:l>=70?`Bien rempli`:`Places disponibles`;return(0,o.jsx)(r,{className:t(``,c),children:(0,o.jsx)(n,{children:(0,o.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,o.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,o.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,o.jsx)(a,{size:18,className:`text-text-secondary`,"aria-hidden":`true`}),(0,o.jsx)(`span`,{className:`text-sm font-medium text-text-primary`,children:`Capacité de la file`})]}),(0,o.jsx)(`span`,{className:t(`text-xs font-medium`,u===`error`?`text-feedback-error`:u===`warning`?`text-feedback-warning`:`text-text-secondary`),children:d})]}),(0,o.jsx)(i,{value:e,max:s,variant:u,showValue:!0,size:`md`})]})})})}s.__docgenInfo={description:``,methods:[],displayName:`CapacityIndicator`,props:{current:{required:!0,tsType:{name:`number`},description:``},max:{required:!0,tsType:{name:`number`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}};var c={title:`Composed/CapacityIndicator`,component:s,tags:[`autodocs`],argTypes:{current:{control:{type:`number`,min:0,max:50}},max:{control:{type:`number`,min:1,max:50}}}},l={args:{current:5,max:30}},u={args:{current:21,max:30}},d={args:{current:27,max:30}},f={args:{current:30,max:30}},p={render:()=>(0,o.jsxs)(`div`,{className:`flex w-80 flex-col gap-4`,children:[(0,o.jsx)(s,{current:5,max:30}),(0,o.jsx)(s,{current:21,max:30}),(0,o.jsx)(s,{current:27,max:30}),(0,o.jsx)(s,{current:30,max:30})]})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    current: 5,
    max: 30
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    current: 21,
    max: 30
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    current: 27,
    max: 30
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    current: 30,
    max: 30
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-80 flex-col gap-4">
            <CapacityIndicator current={5} max={30} />
            <CapacityIndicator current={21} max={30} />
            <CapacityIndicator current={27} max={30} />
            <CapacityIndicator current={30} max={30} />
        </div>
}`,...p.parameters?.docs?.source}}};var m=[`Low`,`Medium`,`AlmostFull`,`Full`,`AllLevels`];export{p as AllLevels,d as AlmostFull,f as Full,l as Low,u as Medium,m as __namedExportsOrder,c as default};