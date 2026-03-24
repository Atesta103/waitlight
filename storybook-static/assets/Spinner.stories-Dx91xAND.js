import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";import{t as n}from"./loader-circle-Cnfgvmq5.js";var r=e(),i={sm:`h-4 w-4`,md:`h-6 w-6`,lg:`h-10 w-10`};function a({size:e=`md`,className:a,label:o=`Chargement…`}){return(0,r.jsxs)(`span`,{role:`status`,className:t(`inline-flex items-center justify-center`,a),children:[(0,r.jsx)(n,{className:t(`animate-spin text-brand-primary`,i[e]),"aria-hidden":`true`}),(0,r.jsx)(`span`,{className:`sr-only`,children:o})]})}a.__docgenInfo={description:``,methods:[],displayName:`Spinner`,props:{size:{required:!1,tsType:{name:`union`,raw:`keyof typeof sizes`,elements:[{name:`literal`,value:`sm`},{name:`literal`,value:`md`},{name:`literal`,value:`lg`}]},description:``,defaultValue:{value:`"md"`,computed:!1}},className:{required:!1,tsType:{name:`string`},description:``},label:{required:!1,tsType:{name:`string`},description:``,defaultValue:{value:`"Chargement…"`,computed:!1}}}};var o={title:`UI/Spinner`,component:a,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`]}}},s={args:{size:`md`}},c={args:{size:`sm`}},l={args:{size:`lg`}},u={render:()=>(0,r.jsxs)(`div`,{className:`flex items-center gap-6`,children:[(0,r.jsx)(a,{size:`sm`}),(0,r.jsx)(a,{size:`md`}),(0,r.jsx)(a,{size:`lg`})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    size: "md"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
        </div>
}`,...u.parameters?.docs?.source}}};var d=[`Default`,`Small`,`Large`,`AllSizes`];export{u as AllSizes,s as Default,l as Large,c as Small,d as __namedExportsOrder,o as default};