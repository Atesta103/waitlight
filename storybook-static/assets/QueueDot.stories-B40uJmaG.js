import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";var n=e();function r({variant:e,className:r}){return(0,n.jsx)(`span`,{"aria-hidden":`true`,className:t(`block shrink-0 rounded-full transition-all`,e===`ahead`&&`h-2.5 w-2.5 bg-text-disabled`,e===`behind`&&`h-2 w-2 bg-border-default`,e===`you`&&[`relative h-4 w-4 bg-brand-primary`,`before:absolute before:inset-0 before:rounded-full`,`before:animate-ping before:bg-brand-primary/40`],r)})}r.__docgenInfo={description:``,methods:[],displayName:`QueueDot`,props:{variant:{required:!0,tsType:{name:`union`,raw:`"ahead" | "you" | "behind"`,elements:[{name:`literal`,value:`"ahead"`},{name:`literal`,value:`"you"`},{name:`literal`,value:`"behind"`}]},description:``},className:{required:!1,tsType:{name:`string`},description:``}}};var i={title:`UI/QueueDot`,component:r,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`ahead`,`you`,`behind`]}}},a={args:{variant:`ahead`}},o={args:{variant:`you`}},s={args:{variant:`behind`}},c={render:()=>(0,n.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,n.jsx)(r,{variant:`ahead`}),(0,n.jsx)(r,{variant:`ahead`}),(0,n.jsx)(r,{variant:`you`}),(0,n.jsx)(r,{variant:`behind`}),(0,n.jsx)(r,{variant:`behind`})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "ahead"
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "you"
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "behind"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-2">
            <QueueDot variant="ahead" />
            <QueueDot variant="ahead" />
            <QueueDot variant="you" />
            <QueueDot variant="behind" />
            <QueueDot variant="behind" />
        </div>
}`,...c.parameters?.docs?.source}}};var l=[`Ahead`,`You`,`Behind`,`QueueVisualization`];export{a as Ahead,s as Behind,c as QueueVisualization,o as You,l as __namedExportsOrder,i as default};