import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./cn-BbnZYjoy.js";var n=e();function r({label:e,className:r}){return(0,n.jsxs)(`div`,{role:`separator`,"aria-label":e,className:t(`flex items-center gap-3`,r),children:[(0,n.jsx)(`span`,{className:`h-px flex-1 bg-border-default`,"aria-hidden":`true`}),e?(0,n.jsx)(`span`,{className:`shrink-0 text-xs font-medium text-text-secondary uppercase tracking-wide`,children:e}):null,(0,n.jsx)(`span`,{className:`h-px flex-1 bg-border-default`,"aria-hidden":`true`})]})}r.__docgenInfo={description:`Atom — Horizontal rule with an optional centred text label.
Used primarily in auth layouts to separate form sections
(e.g. "ou continuer avec").`,methods:[],displayName:`Divider`,props:{label:{required:!1,tsType:{name:`string`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}};var i={title:`UI/Divider`,component:r,tags:[`autodocs`],parameters:{layout:`padded`}},a={args:{}},o={args:{label:`ou continuer avec`}},s={render:()=>(0,n.jsxs)(`div`,{className:`flex w-72 flex-col gap-4`,children:[(0,n.jsx)(`p`,{className:`text-sm text-text-secondary`,children:`Email / Mot de passe`}),(0,n.jsx)(r,{label:`ou continuer avec`}),(0,n.jsx)(`p`,{className:`text-center text-sm text-text-secondary`,children:`Google / Apple`})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: "ou continuer avec"
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-72 flex-col gap-4">
            <p className="text-sm text-text-secondary">Email / Mot de passe</p>
            <Divider label="ou continuer avec" />
            <p className="text-center text-sm text-text-secondary">Google / Apple</p>
        </div>
}`,...s.parameters?.docs?.source}}};var c=[`Plain`,`WithLabel`,`InContext`];export{s as InContext,a as Plain,o as WithLabel,c as __namedExportsOrder,i as default};