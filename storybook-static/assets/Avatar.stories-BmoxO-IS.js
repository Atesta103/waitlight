import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./Avatar-D2QwjyaC.js";var n=e(),r={title:`UI/Avatar`,component:t,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`]}}},i={args:{name:`Marie Dupond`,size:`md`}},a={args:{name:`Photo`,imageUrl:`https://api.dicebear.com/9.x/notionists/svg?seed=waitlight`,size:`md`}},o={args:{name:`Lucas Martin`,size:`sm`}},s={args:{name:`Pierre Bernard`,size:`lg`}},c={render:()=>(0,n.jsx)(`div`,{className:`flex flex-wrap gap-2`,children:[`Alice Dupond`,`Bob Martin`,`Charlie Bernard`,`Diana Petit`,`Eric Leroy`,`Fanny Simon`].map(e=>(0,n.jsx)(t,{name:e,size:`md`},e))})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Marie Dupond",
    size: "md"
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Photo",
    imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=waitlight",
    size: "md"
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Lucas Martin",
    size: "sm"
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Pierre Bernard",
    size: "lg"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-2">
            {["Alice Dupond", "Bob Martin", "Charlie Bernard", "Diana Petit", "Eric Leroy", "Fanny Simon"].map(name => <Avatar key={name} name={name} size="md" />)}
        </div>
}`,...c.parameters?.docs?.source}}};var l=[`Initials`,`WithImage`,`Small`,`Large`,`ColorVariants`];export{c as ColorVariants,i as Initials,s as Large,o as Small,a as WithImage,l as __namedExportsOrder,r as default};